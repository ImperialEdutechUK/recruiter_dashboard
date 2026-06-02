import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { StageTracker } from "@/components/candidate/stage-tracker";
import { CandidateDetail } from "@/components/candidate/candidate-detail";
import { PipelineActions } from "@/components/candidate/pipeline-actions";
import { DecisionForm } from "@/components/review/decision-form";
import { BrandPill } from "@/components/brand/brand-pill";
import { StageBadge } from "@/components/pipeline/stage-badge";
import type { Candidate, Brand, CandidateDocument } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CandidatePage({ params }: { params: { id: string } }) {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: candidate } = await supabase.from("candidates").select("*").eq("id", params.id).single();
  if (!candidate) notFound();
  const c = candidate as Candidate;

  const [{ data: brand }, { data: extra }, { data: documents }, { data: rawNotes }, { data: rawTimeline }] =
    await Promise.all([
      supabase.from("brands").select("*").eq("id", c.primary_brand_id).single(),
      supabase.from("candidate_brands").select("brands(*)").eq("candidate_id", c.id),
      supabase.from("candidate_documents").select("*").eq("candidate_id", c.id).order("updated_at"),
      supabase.from("notes").select("id, body, created_at, profiles:author_id(full_name)")
        .eq("candidate_id", c.id).order("created_at", { ascending: false }),
      supabase.from("stage_transitions").select("id, from_stage, to_stage, created_at, note, profiles:actor_id(full_name)")
        .eq("candidate_id", c.id).order("created_at", { ascending: false }),
    ]);

  const extraBrands = ((extra ?? []).map((r: any) => r.brands).filter(Boolean)) as Brand[];
  const notes = (rawNotes ?? []).map((n: any) => ({
    id: n.id, body: n.body, created_at: n.created_at, author_name: n.profiles?.full_name ?? "System",
  }));
  const timeline = (rawTimeline ?? []).map((t: any) => ({
    id: t.id, from_stage: t.from_stage, to_stage: t.to_stage, created_at: t.created_at,
    note: t.note, actor_name: t.profiles?.full_name ?? "System",
  }));

  const canManage = profile.role === "manager";
  const canDecide = (profile.role === "manager" || profile.role === "director") && c.current_stage === 5;

  return (
    <div className="space-y-6">
      <Link href={profile.role === "director" ? "/review" : "/pipeline"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{c.full_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StageBadge n={c.current_stage} />
            {brand && <BrandPill name={(brand as Brand).name} color={(brand as Brand).color} />}
            {extraBrands.map((b) => <BrandPill key={b.id} name={b.name} color={b.color} />)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <StageTracker current={c.current_stage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CandidateDetail
            c={c}
            documents={(documents ?? []) as CandidateDocument[]}
            notes={notes}
            timeline={timeline}
            canManage={canManage}
          />
        </div>
        <div className="space-y-4">
          {canManage && brand && <PipelineActions c={c} brand={brand as unknown as Brand} />}
          {!canManage && canDecide && (
            <div className="space-y-3 rounded-2xl border bg-card p-4">
              <p className="text-sm font-semibold">Submit your decision</p>
              <DecisionForm candidateId={c.id} />
            </div>
          )}
          {profile.role === "academic" && (
            <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
              Manage this candidate&apos;s induction tasks under <Link href="/handover" className="font-medium text-foreground underline">Academic handover</Link>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
