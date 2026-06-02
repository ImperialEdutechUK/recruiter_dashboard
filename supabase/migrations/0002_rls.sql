-- =====================================================================
-- Row-Level Security + privileged functions
-- Enforces the three roles and brand isolation from the brief (§5, §6, §12.1)
-- =====================================================================

-- ---- Helper functions (SECURITY DEFINER so they can read profiles) ---
create or replace function my_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_manager() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'manager' from profiles where id = auth.uid()), false);
$$;

-- manager sees every brand; others only their assigned brands
create or replace function has_brand_access(b uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select is_manager()
      or exists (select 1 from profile_brands pb where pb.profile_id = auth.uid() and pb.brand_id = b);
$$;

-- can the current user see this candidate at all?
create or replace function can_see_candidate(c candidates) returns boolean
  language sql stable security definer set search_path = public as $$
  select case my_role()
    when 'manager'  then true
    when 'director' then c.current_stage >= 5 and has_brand_access(c.primary_brand_id)
    when 'academic' then c.current_stage = 10 and has_brand_access(c.primary_brand_id)
    else false end;
$$;

-- ---- Enable RLS everywhere ------------------------------------------
alter table brands               enable row level security;
alter table profiles             enable row level security;
alter table profile_brands       enable row level security;
alter table candidates           enable row level security;
alter table candidate_brands     enable row level security;
alter table stage_transitions    enable row level security;
alter table document_templates   enable row level security;
alter table candidate_documents  enable row level security;
alter table notes                enable row level security;
alter table adverts              enable row level security;
alter table induction_templates  enable row level security;
alter table induction_tasks      enable row level security;

-- ---- Brands: readable by any authenticated user ---------------------
create policy brands_read on brands for select to authenticated using (true);
create policy brands_admin on brands for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Profiles -------------------------------------------------------
-- Internal staff tool: any signed-in user may read colleague names/roles
-- (used to attribute notes and audit-log entries). Only managers may write.
create policy profiles_read on profiles for select to authenticated using (true);
create policy profiles_manager_write on profiles for all to authenticated using (is_manager()) with check (is_manager());

create policy pb_self_read on profile_brands for select to authenticated using (profile_id = auth.uid() or is_manager());
create policy pb_manager_write on profile_brands for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Candidates -----------------------------------------------------
-- read: anyone allowed to see the candidate
create policy candidates_read on candidates for select to authenticated
  using (can_see_candidate(candidates));
-- only the manager creates/edits candidate rows directly
create policy candidates_manager_insert on candidates for insert to authenticated with check (is_manager());
create policy candidates_manager_update on candidates for update to authenticated using (is_manager()) with check (is_manager());
create policy candidates_manager_delete on candidates for delete to authenticated using (is_manager());
-- NOTE: director decisions go through submit_decision(); academics never edit candidate rows.

create policy cb_read on candidate_brands for select to authenticated
  using (exists (select 1 from candidates c where c.id = candidate_id and can_see_candidate(c)));
create policy cb_manager_write on candidate_brands for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Stage transitions: read if candidate visible; insert via fn ----
create policy st_read on stage_transitions for select to authenticated
  using (exists (select 1 from candidates c where c.id = candidate_id and can_see_candidate(c)));
-- inserts handled by advance_stage()/submit_decision() (security definer). No update/delete = immutable.

-- ---- Document templates ---------------------------------------------
create policy dt_read on document_templates for select to authenticated using (true);
create policy dt_manager_write on document_templates for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Candidate documents --------------------------------------------
create policy cd_read on candidate_documents for select to authenticated
  using (exists (select 1 from candidates c where c.id = candidate_id and can_see_candidate(c)));
create policy cd_manager_write on candidate_documents for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Notes: visible to manager/director/academic who can see the candidate
create policy notes_read on notes for select to authenticated
  using (exists (select 1 from candidates c where c.id = candidate_id and can_see_candidate(c)));
create policy notes_insert on notes for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from candidates c where c.id = candidate_id and can_see_candidate(c))
  );

-- ---- Adverts: manager only ------------------------------------------
create policy adverts_manager_all on adverts for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Induction templates --------------------------------------------
create policy it_read on induction_templates for select to authenticated using (true);
create policy it_manager_write on induction_templates for all to authenticated using (is_manager()) with check (is_manager());

-- ---- Induction tasks: manager + academic (with brand access) --------
create policy itask_read on induction_tasks for select to authenticated
  using (exists (select 1 from candidates c where c.id = candidate_id and can_see_candidate(c)));
create policy itask_write on induction_tasks for update to authenticated
  using (
    is_manager()
    or (my_role() = 'academic'
        and exists (select 1 from candidates c where c.id = candidate_id and has_brand_access(c.primary_brand_id)))
  )
  with check (true);
create policy itask_manager_insert on induction_tasks for insert to authenticated with check (is_manager());

-- =====================================================================
-- Privileged workflow functions
-- =====================================================================

-- Advance / move a candidate to a new stage, writing an immutable audit row.
create or replace function advance_stage(p_candidate uuid, p_to_stage smallint, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_from smallint;
begin
  if not is_manager() then raise exception 'Only the manager can change pipeline stages'; end if;
  select current_stage into v_from from candidates where id = p_candidate;
  if v_from is null then raise exception 'Candidate not found'; end if;

  update candidates set current_stage = p_to_stage where id = p_candidate;
  insert into stage_transitions (candidate_id, from_stage, to_stage, actor_id, note)
  values (p_candidate, v_from, p_to_stage, auth.uid(), p_note);

  -- entering stage 7: build the role-specific checklist if not already present
  if p_to_stage = 7 then perform build_document_checklist(p_candidate); end if;
  -- entering stage 10: build the induction task list
  if p_to_stage = 10 then perform build_induction_tasks(p_candidate); end if;
end; $$;

-- Director submits an approve/reject decision (only path that edits the row for a director).
create or replace function submit_decision(p_candidate uuid, p_decision decision_outcome, p_notes text default null)
returns void language plpgsql security definer set search_path = public as $$
declare c candidates;
begin
  select * into c from candidates where id = p_candidate;
  if c.id is null then raise exception 'Candidate not found'; end if;
  if my_role() not in ('manager','director') then raise exception 'Not permitted'; end if;
  if my_role() = 'director' and not (c.current_stage >= 5 and has_brand_access(c.primary_brand_id)) then
    raise exception 'No access to this candidate';
  end if;

  update candidates
     set decision = p_decision, director_notes = p_notes,
         decided_by = auth.uid(), decided_at = now(),
         current_stage = 6
   where id = p_candidate;

  insert into stage_transitions (candidate_id, from_stage, to_stage, actor_id, note)
  values (p_candidate, c.current_stage, 6, auth.uid(),
          'Director decision: ' || p_decision::text || coalesce(' — ' || p_notes, ''));
end; $$;

-- Populate candidate_documents from active templates (universal + matching role).
create or replace function build_document_checklist(p_candidate uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_role role_type;
begin
  select role_type into v_role from candidates where id = p_candidate;
  insert into candidate_documents (candidate_id, label)
  select p_candidate, t.label
    from document_templates t
   where t.is_active and (t.applies_to is null or t.applies_to = v_role)
     and not exists (
       select 1 from candidate_documents d where d.candidate_id = p_candidate and d.label = t.label
     )
   order by t.sort_order;
end; $$;

create or replace function build_induction_tasks(p_candidate uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into induction_tasks (candidate_id, label)
  select p_candidate, t.label from induction_templates t
   where t.is_active
     and not exists (select 1 from induction_tasks i where i.candidate_id = p_candidate and i.label = t.label)
   order by t.sort_order;
end; $$;

-- Auto-create a profile row when a new auth user is created.
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.email),
          new.email,
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'director'));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
