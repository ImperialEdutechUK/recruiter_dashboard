import { Users2, TrendingUp, Clock, FileCheck2 } from "lucide-react";
import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/stat-card";
import { StageBar } from "@/components/pipeline/stage-bar";
import { CandidateTable } from "@/components/candidate/candidate-table";
import { NewCandidateDialog } from "@/components/pipeline/new-candidate-dialog";
import { enrichRows } from "@/lib/candidates/enrich";
import { STAGES } from "@/lib/constants/stages";
import type { Candidate, Brand } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data: rows } = await supabase.from("candidates").select("*").order("updated_at", { ascending: false });
  const { data: brands } = await supabase.from("brands").select("*").order("name");
  const candidates = (rows ?? []) as Candidate[];

  const counts: Record<number, number> = {};
  STAGES.forEach((s) => { counts[s.n] = candidates.filter((c) => c.current_stage === s.n).length; });

  const total = candidates.length;
  const inProgress = candidates.filter((c) => c.decision !== "rejected" && c.current_stage < 10).length;
  const pendingReview = counts[5] ?? 0;
  const signed = candidates.filter((c) => c.final_contract_status === "signed").length;

  const tableRows = await enrichRows(supabase, candidates);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Candidates" value={total} href="/candidates" linkText="View all" icon={Users2} tone="blue" />
        <StatCard label="In Progress" value={inProgress} href="/pipeline" linkText="View pipeline" icon={TrendingUp} tone="green" />
        <StatCard label="Pending Review" value={pendingReview} href="/review" linkText="View reviews" icon={Clock} tone="amber" />
        <StatCard label="Contracts Signed" value={signed} href="/contracts" linkText="View all" icon={FileCheck2} tone="purple" />
      </div>

      <div className="card-shadow rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
          <h2 className="text-lg font-bold tracking-tight">Recruitment Pipeline</h2>
          <NewCandidateDialog brands={(brands ?? []) as Brand[]} label="Add Candidate" />
        </div>

        <StageBar counts={counts} />

        <div className="mt-6 border-t pt-5">
          <CandidateTable rows={tableRows} pageSize={8} />
        </div>
      </div>
    </div>
  );
}
