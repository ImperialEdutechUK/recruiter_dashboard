import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CandidateTable } from "@/components/candidate/candidate-table";
import { enrichRows } from "@/lib/candidates/enrich";
import type { Candidate } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data: rows } = await supabase.from("candidates").select("*").eq("current_stage", 7).order("updated_at");
  const tableRows = await enrichRows(supabase, (rows ?? []) as Candidate[]);

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" subtitle="Candidates in document collection — open a record to update statuses (Stage 7)" />
      <div className="card-shadow rounded-2xl border bg-card p-5 sm:p-6">
        <CandidateTable rows={tableRows} pageSize={10} />
      </div>
    </div>
  );
}
