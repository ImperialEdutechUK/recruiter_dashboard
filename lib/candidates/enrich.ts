import type { SupabaseClient } from "@supabase/supabase-js";
import type { Candidate, Brand } from "@/types/database";
import type { TableRow } from "@/components/candidate/candidate-table";
import { roleLabel, subjectLabel, levelLabel, CONTRACT_STATUSES } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils";

function contractLabel(v: string) {
  return CONTRACT_STATUSES.find((s) => s.value === v)?.label ?? v;
}

function substatusFor(c: Candidate, docs?: { total: number; approved: number }): string | null {
  switch (c.current_stage) {
    case 3: return c.interview_date ? `Interview: ${formatDate(c.interview_date)}` : null;
    case 4: return c.interview_date ? `Interviewed: ${formatDate(c.interview_date)}` : null;
    case 5: return `Pending since ${formatDate(c.updated_at)}`;
    case 6: return c.decided_at ? `Decision: ${formatDate(c.decided_at)}` : null;
    case 7: return docs ? `${docs.approved}/${docs.total} approved` : null;
    case 9: return `Contract ${contractLabel(c.final_contract_status).toLowerCase()}`;
    default: return null;
  }
}

/** Turn candidate rows into fully-enriched table rows (brands, owner, sub-status). */
export async function enrichRows(supabase: SupabaseClient, candidates: Candidate[]): Promise<TableRow[]> {
  if (candidates.length === 0) return [];
  const ids = candidates.map((c) => c.id);

  const [{ data: brands }, { data: profiles }, { data: cb }, { data: docs }] = await Promise.all([
    supabase.from("brands").select("*"),
    supabase.from("profiles").select("id, full_name"),
    supabase.from("candidate_brands").select("candidate_id, brand_id").in("candidate_id", ids),
    supabase.from("candidate_documents").select("candidate_id, status").in("candidate_id", ids),
  ]);

  const brandMap = Object.fromEntries((brands ?? []).map((b: Brand) => [b.id, b])) as Record<string, Brand>;
  const nameMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.full_name])) as Record<string, string>;

  const extraByCand: Record<string, string[]> = {};
  (cb ?? []).forEach((r: any) => { (extraByCand[r.candidate_id] ??= []).push(r.brand_id); });

  const docStats: Record<string, { total: number; approved: number }> = {};
  (docs ?? []).forEach((d: any) => {
    const s = (docStats[d.candidate_id] ??= { total: 0, approved: 0 });
    s.total++; if (d.status === "approved") s.approved++;
  });

  return candidates.map((c) => {
    const brandList: { name: string; color: string }[] = [];
    const primary = brandMap[c.primary_brand_id];
    if (primary) brandList.push({ name: primary.name, color: primary.color });
    (extraByCand[c.id] ?? []).forEach((bid) => {
      const b = brandMap[bid];
      if (b) brandList.push({ name: b.name, color: b.color });
    });
    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      role_label: roleLabel(c.role_type),
      brands: brandList,
      subject_label: subjectLabel(c.subject_area),
      level_label: levelLabel(c.level),
      current_stage: c.current_stage,
      substatus: substatusFor(c, docStats[c.id]),
      updated_at: c.updated_at,
      owner_name: c.created_by ? (nameMap[c.created_by] ?? "—") : "—",
    };
  });
}
