"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendNotification, emailTemplates } from "@/lib/email/resend";
import type { RoleType } from "@/types/database";

async function uid() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ---- Create a candidate (manager only — enforced by RLS) -------------
export async function createCandidate(formData: FormData) {
  const supabase = createClient();
  const me = await uid();

  const suitable = formData.getAll("suitable_roles").map(String) as RoleType[];
  const additional = formData.getAll("additional_brands").map(String);

  const { data, error } = await supabase
    .from("candidates")
    .insert({
      full_name: String(formData.get("full_name")),
      email: String(formData.get("email")),
      phone: (formData.get("phone") as string) || null,
      primary_brand_id: String(formData.get("primary_brand_id")),
      role_type: String(formData.get("role_type")),
      subject_area: (formData.get("subject_area") as string) || null,
      level: (formData.get("level") as string) || "na",
      suitable_roles: suitable,
      created_by: me,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (additional.length && data) {
    await supabase.from("candidate_brands").insert(
      additional.map((brand_id) => ({ candidate_id: data.id, brand_id })),
    );
  }
  revalidatePath("/pipeline");
  return { id: data?.id };
}

// ---- Update arbitrary candidate fields (manager only) ----------------
export async function updateCandidate(id: string, patch: Record<string, unknown>) {
  const supabase = createClient();
  const { error } = await supabase.from("candidates").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/candidates/${id}`);
  revalidatePath("/pipeline");
  return {};
}

// ---- Advance / set stage (via SECURITY DEFINER fn) -------------------
export async function advanceStage(id: string, toStage: number, note?: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("advance_stage", {
    p_candidate: id, p_to_stage: toStage, p_note: note ?? null,
  });
  if (error) return { error: error.message };

  // Stage 5 → notify directors who have access to this candidate's brand
  if (toStage === 5) {
    const { data: c } = await supabase
      .from("candidates").select("full_name, primary_brand_id").eq("id", id).single();
    if (c) {
      const { data: dirs } = await supabase
        .from("profile_brands")
        .select("profiles!inner(email, role)")
        .eq("brand_id", c.primary_brand_id);
      const emails = (dirs ?? [])
        .map((d: any) => d.profiles)
        .filter((p: any) => p?.role === "director")
        .map((p: any) => p.email);
      const tpl = emailTemplates.pendingReview(c.full_name, id);
      await Promise.all(emails.map((e: string) => sendNotification(e, tpl.subject, tpl.html)));
    }
  }
  revalidatePath(`/candidates/${id}`);
  revalidatePath("/pipeline");
  revalidatePath("/review");
  return {};
}

// ---- Director decision (via SECURITY DEFINER fn) ---------------------
export async function submitDecision(id: string, decision: "approved" | "rejected", notes?: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("submit_decision", {
    p_candidate: id, p_decision: decision, p_notes: notes ?? null,
  });
  if (error) return { error: error.message };

  const { data: c } = await supabase.from("candidates").select("full_name").eq("id", id).single();
  const { data: mgrs } = await supabase.from("profiles").select("email").eq("role", "manager");
  if (c) {
    const tpl = emailTemplates.decisionMade(c.full_name, decision, id);
    await Promise.all((mgrs ?? []).map((m) => sendNotification(m.email, tpl.subject, tpl.html)));
  }
  revalidatePath(`/candidates/${id}`);
  revalidatePath("/review");
  revalidatePath("/pipeline");
  return {};
}

// ---- Document checklist status (manager only) ------------------------
export async function updateDocument(docId: string, candidateId: string, status: string, notes?: string) {
  const supabase = createClient();
  const me = await uid();
  const { error } = await supabase
    .from("candidate_documents")
    .update({ status, notes: notes ?? null, updated_by: me, updated_at: new Date().toISOString() })
    .eq("id", docId);
  if (error) return { error: error.message };
  revalidatePath(`/candidates/${candidateId}`);
  return {};
}

// ---- Internal notes thread -------------------------------------------
export async function addNote(candidateId: string, body: string) {
  const supabase = createClient();
  const me = await uid();
  if (!body.trim()) return { error: "Note is empty" };
  const { error } = await supabase.from("notes").insert({ candidate_id: candidateId, author_id: me, body });
  if (error) return { error: error.message };
  revalidatePath(`/candidates/${candidateId}`);
  return {};
}

// ---- Induction tasks (manager + academic) ----------------------------
export async function toggleInduction(taskId: string, candidateId: string, complete: boolean) {
  const supabase = createClient();
  const me = await uid();
  const { error } = await supabase
    .from("induction_tasks")
    .update({
      is_complete: complete,
      completed_by: complete ? me : null,
      completed_at: complete ? new Date().toISOString() : null,
    })
    .eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath("/handover");
  revalidatePath(`/candidates/${candidateId}`);
  return {};
}

// ---- Job adverts (manager only) --------------------------------------
export async function createAdvert(formData: FormData) {
  const supabase = createClient();
  const me = await uid();
  const { error } = await supabase.from("adverts").insert({
    brand_id: String(formData.get("brand_id")),
    role_type: String(formData.get("role_type")),
    title: String(formData.get("title")),
    body: (formData.get("body") as string) || null,
    indeed_job_id: (formData.get("indeed_job_id") as string) || null,
    status: (formData.get("status") as string) || "draft",
    created_by: me,
  });
  if (error) return { error: error.message };
  revalidatePath("/postings");
  return {};
}

export async function updateAdvert(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("adverts").update({
    brand_id: String(formData.get("brand_id")),
    role_type: String(formData.get("role_type")),
    title: String(formData.get("title")),
    body: (formData.get("body") as string) || null,
    indeed_job_id: (formData.get("indeed_job_id") as string) || null,
    status: (formData.get("status") as string) || "draft",
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/postings");
  return {};
}

export async function deleteAdvert(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("adverts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/postings");
  return {};
}
