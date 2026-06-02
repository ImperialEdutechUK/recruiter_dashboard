import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { CandidateTable } from "@/components/candidate/candidate-table";
import { NewCandidateDialog } from "@/components/pipeline/new-candidate-dialog";
import { enrichRows } from "@/lib/candidates/enrich";
import type { Candidate, Brand } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data: rows } = await supabase.from("candidates").select("*").order("updated_at", { ascending: false });
  const { data: brands } = await supabase.from("brands").select("*").order("name");
  const tableRows = await enrichRows(supabase, (rows ?? []) as Candidate[]);

  return (
    <div className="space-y-6">
      <PageHeader title="Candidates" subtitle="All freelance educators across every brand and stage">
        <NewCandidateDialog brands={(brands ?? []) as Brand[]} label="Add Candidate" />
      </PageHeader>
      <div className="card-shadow rounded-2xl border bg-card p-5 sm:p-6">
        <CandidateTable rows={tableRows} pageSize={10} />
      </div>
    </div>
  );
}
