import Link from "next/link";
import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { InductionChecklist } from "@/components/handover/induction-checklist";
import { BrandPill } from "@/components/brand/brand-pill";
import { Badge } from "@/components/ui/badge";
import { roleLabel, subjectLabel } from "@/lib/constants/roles";
import type { Candidate, Brand, InductionTask, CandidateDocument } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HandoverPage() {
  await requireRole("manager", "academic");
  const supabase = createClient();

  const { data: rows } = await supabase.from("candidates").select("*").eq("current_stage", 10).order("updated_at");
  const candidates = (rows ?? []) as Candidate[];
  const ids = candidates.map((c) => c.id);

  const [{ data: brands }, { data: tasks }, { data: docs }] = await Promise.all([
    supabase.from("brands").select("*"),
    ids.length ? supabase.from("induction_tasks").select("*").in("candidate_id", ids) : Promise.resolve({ data: [] as InductionTask[] }),
    ids.length ? supabase.from("candidate_documents").select("candidate_id, status").in("candidate_id", ids) : Promise.resolve({ data: [] as Pick<CandidateDocument, "candidate_id" | "status">[] }),
  ]);

  const brandMap = Object.fromEntries((brands ?? []).map((b: Brand) => [b.id, b]));
  const tasksByCand = (tasks ?? []).reduce((acc: Record<string, InductionTask[]>, t: InductionTask) => {
    (acc[t.candidate_id] ??= []).push(t); return acc;
  }, {});
  const docStats = (docs ?? []).reduce((acc: Record<string, { total: number; approved: number }>, d: any) => {
    const s = (acc[d.candidate_id] ??= { total: 0, approved: 0 });
    s.total++; if (d.status === "approved") s.approved++; return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic handover</h1>
        <p className="text-sm text-muted-foreground">{candidates.length} contracted educator{candidates.length !== 1 && "s"} in onboarding</p>
      </div>

      {candidates.length === 0 && (
        <div className="rounded-lg border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No contracted candidates yet. They appear here once they reach Stage 10.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {candidates.map((c) => {
          const b = brandMap[c.primary_brand_id];
          const ds = docStats[c.id] ?? { total: 0, approved: 0 };
          return (
            <div key={c.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/candidates/${c.id}`} className="font-semibold hover:underline">{c.full_name}</Link>
                {b && <BrandPill name={b.name} color={b.color} />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{roleLabel(c.role_type)} · {subjectLabel(c.subject_area)}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="muted">Docs {ds.approved}/{ds.total} approved</Badge>
                <Badge variant={c.final_contract_status === "signed" ? "success" : "muted"}>Contract {c.final_contract_status.replace("_", " ")}</Badge>
              </div>
              <div className="mt-4 border-t pt-4">
                <InductionChecklist candidateId={c.id} tasks={tasksByCand[c.id] ?? []} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
