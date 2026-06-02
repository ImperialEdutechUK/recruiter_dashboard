import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CandidateTable } from "@/components/candidate/candidate-table";
import { enrichRows } from "@/lib/candidates/enrich";
import type { Candidate } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data: rows } = await supabase.from("candidates").select("*").in("current_stage", [8, 9, 10]).order("updated_at");
  const tableRows = await enrichRows(supabase, (rows ?? []) as Candidate[]);

  return (
    <div className="space-y-6">
      <PageHeader title="Contracts" subtitle="Draft, final and signed contracts (Stages 8–10)" />
      <div className="card-shadow rounded-2xl border bg-card p-5 sm:p-6">
        <CandidateTable rows={tableRows} pageSize={10} />
      </div>
    </div>
  );
}
