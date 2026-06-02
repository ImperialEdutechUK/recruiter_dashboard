-- =====================================================================
-- Freelance Recruitment Tracker — schema
-- =====================================================================

-- ---- Enums -----------------------------------------------------------
create type user_role        as enum ('manager', 'director', 'academic');
create type role_type         as enum ('tutor','assessor','iqa_tutor','webinar_moderator','webinar_tutor','video_presenter');
create type subject_area      as enum ('health_social_care','early_years','education_training','business_management','data_science_it','cyber_security','other');
create type qual_level        as enum ('level_2','level_3','level_4','level_5','level_6','na');
create type document_status   as enum ('not_submitted','received','approved','rejected');
create type decision_outcome  as enum ('approved','rejected');
create type contract_status   as enum ('not_sent','sent','signed','declined');
create type advert_status     as enum ('draft','posted');

-- ---- Brands (fixed three) -------------------------------------------
create table brands (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  name  text not null,
  color text not null
);

-- ---- Profiles (1:1 with auth.users) ---------------------------------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null,
  role       user_role not null default 'director',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- which brands a director / academic may access (manager sees all)
create table profile_brands (
  profile_id uuid references profiles(id) on delete cascade,
  brand_id   uuid references brands(id) on delete cascade,
  primary key (profile_id, brand_id)
);

-- ---- Candidates ------------------------------------------------------
create table candidates (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  email            text not null,
  phone            text,
  primary_brand_id uuid not null references brands(id),
  role_type        role_type not null,
  subject_area     subject_area,
  level            qual_level default 'na',
  suitable_roles   role_type[] not null default '{}',
  current_stage    smallint not null default 1 check (current_stage between 1 and 10),
  -- interview
  interview_date        date,
  interview_notes       text,
  rating                smallint check (rating between 1 and 5),
  teams_recording_url   text,
  teams_transcript_url  text,
  teams_notes_url       text,
  -- director decision
  decision         decision_outcome,
  director_notes   text,
  decided_by       uuid references profiles(id),
  decided_at       timestamptz,
  -- contract
  contract_notes        text,
  final_contract_status contract_status not null default 'not_sent',
  -- meta
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- additional brands a candidate can work for (cross-brand tagging)
create table candidate_brands (
  candidate_id uuid references candidates(id) on delete cascade,
  brand_id     uuid references brands(id) on delete cascade,
  primary key (candidate_id, brand_id)
);

-- ---- Immutable audit log of stage transitions -----------------------
create table stage_transitions (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  from_stage   smallint,
  to_stage     smallint not null,
  actor_id     uuid references profiles(id),
  note         text,
  created_at   timestamptz not null default now()
);

-- ---- Document checklist ---------------------------------------------
create table document_templates (
  id         uuid primary key default gen_random_uuid(),
  -- null applies_to = universal (all roles)
  applies_to role_type,
  label      text not null,
  sort_order int not null default 0,
  is_active  boolean not null default true
);

create table candidate_documents (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  label        text not null,
  status       document_status not null default 'not_submitted',
  notes        text,
  updated_by   uuid references profiles(id),
  updated_at   timestamptz not null default now()
);

-- ---- Internal notes thread ------------------------------------------
create table notes (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  author_id    uuid references profiles(id),
  body         text not null,
  created_at   timestamptz not null default now()
);

-- ---- Job adverts -----------------------------------------------------
create table adverts (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid not null references brands(id),
  role_type     role_type not null,
  title         text not null,
  body          text,
  indeed_job_id text,
  status        advert_status not null default 'draft',
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now()
);

-- ---- Induction (academic handover) ----------------------------------
create table induction_templates (
  id        uuid primary key default gen_random_uuid(),
  label     text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table induction_tasks (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  label        text not null,
  is_complete  boolean not null default false,
  completed_by uuid references profiles(id),
  completed_at timestamptz
);

-- ---- Indexes ---------------------------------------------------------
create index on candidates (current_stage);
create index on candidates (primary_brand_id);
create index on candidates (role_type);
create index on stage_transitions (candidate_id, created_at);
create index on candidate_documents (candidate_id);
create index on notes (candidate_id, created_at);

-- ---- updated_at trigger ---------------------------------------------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger candidates_touch before update on candidates
  for each row execute function touch_updated_at();
