import Link from "next/link";
import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ColoredAvatar } from "@/components/ui/colored-avatar";
import { StageBadge } from "@/components/pipeline/stage-badge";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  await requireRole("manager");
  const supabase = createClient();
  const { data } = await supabase
    .from("stage_transitions")
    .select("id, candidate_id, from_stage, to_stage, note, created_at, candidates(full_name), profiles:actor_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(80);

  const events = (data ?? []).map((e: any) => ({
    id: e.id, candidate_id: e.candidate_id, from_stage: e.from_stage, to_stage: e.to_stage,
    note: e.note, created_at: e.created_at,
    candidate: e.candidates?.full_name ?? "Candidate",
    actor: e.profiles?.full_name ?? "System",
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Log" subtitle="Immutable record of every stage change across the pipeline" />
      <div className="card-shadow rounded-2xl border bg-card">
        <ul className="divide-y">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 p-4">
              <ColoredAvatar name={e.actor} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold">{e.actor}</span>
                  <span className="text-muted-foreground">{e.from_stage ? "moved" : "added"}</span>
                  <Link href={`/candidates/${e.candidate_id}`} className="font-medium text-primary hover:underline">{e.candidate}</Link>
                  <span className="text-muted-foreground">{e.from_stage ? "to" : "at"}</span>
                  <StageBadge n={e.to_stage} />
                </div>
                {e.note && <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
            </li>
          ))}
          {events.length === 0 && <li className="p-10 text-center text-sm text-muted-foreground">No activity recorded yet.</li>}
        </ul>
      </div>
    </div>
  );
}
