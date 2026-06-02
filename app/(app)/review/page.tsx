import Link from "next/link";
import { ExternalLink, FileVideo, FileText, NotebookPen } from "lucide-react";
import { requireRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { DecisionForm } from "@/components/review/decision-form";
import { BrandPill } from "@/components/brand/brand-pill";
import { StarRating } from "@/components/ui/star-rating";
import { roleLabel, subjectLabel } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils";
import type { Candidate, Brand } from "@/types/database";

export const dynamic = "force-dynamic";

function ReviewLink({ href, icon: Icon, label }: { href: string | null; icon: any; label: string }) {
  if (!href) return <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label} —</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"><Icon className="h-3.5 w-3.5" />{label}<ExternalLink className="h-3 w-3 text-muted-foreground" /></a>;
}

export default async function ReviewPage() {
  await requireRole("manager", "director");
  const supabase = createClient();

  // RLS already restricts directors to stage >= 5 within their brands.
  const { data: rows } = await supabase
    .from("candidates").select("*").eq("current_stage", 5).order("updated_at");
  const { data: brands } = await supabase.from("brands").select("*");
  const brandMap = Object.fromEntries((brands ?? []).map((b: Brand) => [b.id, b]));
  const candidates = (rows ?? []) as Candidate[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review queue</h1>
        <p className="text-sm text-muted-foreground">{candidates.length} candidate{candidates.length !== 1 && "s"} pending your decision</p>
      </div>

      {candidates.length === 0 && (
        <div className="rounded-lg border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Nothing to review right now.
        </div>
      )}

      <div className="space-y-4">
        {candidates.map((c) => {
          const b = brandMap[c.primary_brand_id];
          return (
            <div key={c.id} className="grid gap-5 rounded-2xl border bg-card p-5 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/candidates/${c.id}`} className="text-lg font-semibold hover:underline">{c.full_name}</Link>
                  {b && <BrandPill name={b.name} color={b.color} />}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span><span className="text-foreground">{roleLabel(c.role_type)}</span> · {subjectLabel(c.subject_area)}</span>
                  <span>Interview: {formatDate(c.interview_date)}</span>
                  <span className="flex items-center gap-2">Rating: <StarRating value={c.rating} readOnly /></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ReviewLink href={c.teams_recording_url} icon={FileVideo} label="Recording" />
                  <ReviewLink href={c.teams_transcript_url} icon={FileText} label="Transcript" />
                  <ReviewLink href={c.teams_notes_url} icon={NotebookPen} label="Notes" />
                </div>
                {c.interview_notes && <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{c.interview_notes}</p>}
              </div>
              <div className="border-t pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <DecisionForm candidateId={c.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
