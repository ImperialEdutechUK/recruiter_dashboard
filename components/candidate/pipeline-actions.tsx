"use client";
import { useState, useTransition } from "react";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { updateCandidate, advanceStage } from "@/lib/actions/candidates";
import { CONTRACT_STATUSES, roleLabel } from "@/lib/constants/roles";
import { stage } from "@/lib/constants/stages";
import type { Candidate, Brand } from "@/types/database";

export function PipelineActions({ c, brand }: { c: Candidate; brand?: Brand }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const run = (fn: () => Promise<{ error?: string } | void>) => {
    setErr(null);
    start(async () => { const r = await fn(); if (r && "error" in r && r.error) setErr(r.error); });
  };

  const next = (to: number, patch?: Record<string, unknown>) =>
    run(async () => { if (patch) await updateCandidate(c.id, patch); return advanceStage(c.id, to); });

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <p className="text-sm font-semibold">Stage {c.current_stage}: {stage(c.current_stage).name}</p>
      <p className="text-xs text-muted-foreground">{stage(c.current_stage).blurb}</p>

      {c.current_stage === 1 && (
        <Button className="w-full" disabled={pending} onClick={() => next(2)}>Advance to Shortlisted <ArrowRight className="h-4 w-4" /></Button>
      )}

      {c.current_stage === 2 && <ShortlistStep c={c} brand={brand} onNext={() => next(3)} pending={pending} />}

      {c.current_stage === 3 && <InterviewDateStep c={c} onNext={(d) => next(4, { interview_date: d })} pending={pending} />}

      {c.current_stage === 4 && <InterviewConductedStep c={c} onSave={(p) => run(() => updateCandidate(c.id, p))} onNext={(p) => next(5, p)} pending={pending} />}

      {c.current_stage === 5 && (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">Awaiting director review. Directors see this in their review queue.</p>
      )}

      {c.current_stage === 6 && (
        c.decision === "approved"
          ? <Button className="w-full" disabled={pending} onClick={() => next(7)}>Start document collection <ArrowRight className="h-4 w-4" /></Button>
          : <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">Candidate was rejected at director review.</p>
      )}

      {c.current_stage === 7 && (
        <>
          <p className="text-xs text-muted-foreground">Update document statuses in the Documents tab.</p>
          <Button className="w-full" disabled={pending} onClick={() => next(8)}>Advance to Draft Contract <ArrowRight className="h-4 w-4" /></Button>
        </>
      )}

      {c.current_stage === 8 && <DraftContractStep c={c} onSave={(p) => run(() => updateCandidate(c.id, p))} onNext={(p) => next(9, p)} pending={pending} />}

      {c.current_stage === 9 && <FinalContractStep c={c} onSave={(p) => run(() => updateCandidate(c.id, p))} onNext={() => next(10)} pending={pending} />}

      {c.current_stage === 10 && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">Contracted. Induction is managed by the academic team in Handover.</p>
      )}

      {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}

function ShortlistStep({ c, brand, onNext, pending }:
  { c: Candidate; brand?: Brand; onNext: () => void; pending: boolean }) {
  const [copied, setCopied] = useState(false);
  const tpl = `Dear Candidate,

Thank you for your application for the ${roleLabel(c.role_type)} role at ${brand?.name ?? "our college"}.

We would like to invite you to a short online interview. Please book a convenient slot using my calendar link below:

[ Insert your Calendly link ]

The interview will be held on Microsoft Teams. Kind regards,
Recruitment Team`;
  return (
    <div className="space-y-2">
      <Label className="text-xs">BCC interview invitation (copy, add your Calendly link, send)</Label>
      <Textarea readOnly value={tpl} className="h-40 text-xs" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(tpl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
        </Button>
        <Button className="flex-1" size="sm" disabled={pending} onClick={onNext}>Mark interview scheduled <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function InterviewDateStep({ c, onNext, pending }:
  { c: Candidate; onNext: (d: string) => void; pending: boolean }) {
  const [date, setDate] = useState(c.interview_date ?? "");
  return (
    <div className="space-y-2">
      <Label htmlFor="idate" className="text-xs">Confirmed interview date</Label>
      <Input id="idate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Button className="w-full" disabled={pending || !date} onClick={() => onNext(date)}>Mark interview conducted <ArrowRight className="h-4 w-4" /></Button>
    </div>
  );
}

function InterviewConductedStep({ c, onSave, onNext, pending }:
  { c: Candidate; onSave: (p: Record<string, unknown>) => void; onNext: (p: Record<string, unknown>) => void; pending: boolean }) {
  const [rec, setRec] = useState(c.teams_recording_url ?? "");
  const [tr, setTr] = useState(c.teams_transcript_url ?? "");
  const [no, setNo] = useState(c.teams_notes_url ?? "");
  const [rating, setRating] = useState<number | null>(c.rating);
  const [notes, setNotes] = useState(c.interview_notes ?? "");
  const patch = { teams_recording_url: rec, teams_transcript_url: tr, teams_notes_url: no, rating, interview_notes: notes };
  return (
    <div className="space-y-2">
      <Label className="text-xs">OneDrive links</Label>
      <Input placeholder="Teams recording URL" value={rec} onChange={(e) => setRec(e.target.value)} />
      <Input placeholder="Teams transcript URL" value={tr} onChange={(e) => setTr(e.target.value)} />
      <Input placeholder="Teams meeting notes URL" value={no} onChange={(e) => setNo(e.target.value)} />
      <div className="flex items-center justify-between pt-1">
        <Label className="text-xs">Rating</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <Textarea placeholder="Interview notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={pending} onClick={() => onSave(patch)}>Save</Button>
        <Button className="flex-1" size="sm" disabled={pending} onClick={() => onNext(patch)}>Send to director review <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function DraftContractStep({ c, onSave, onNext, pending }:
  { c: Candidate; onSave: (p: Record<string, unknown>) => void; onNext: (p: Record<string, unknown>) => void; pending: boolean }) {
  const [notes, setNotes] = useState(c.contract_notes ?? "");
  const patch = { contract_notes: notes };
  return (
    <div className="space-y-2">
      <Label htmlFor="cnotes" className="text-xs">Draft rates / contract notes</Label>
      <Textarea id="cnotes" placeholder="e.g. £35/hr delivery, £20/hr marking" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={pending} onClick={() => onSave(patch)}>Save</Button>
        <Button className="flex-1" size="sm" disabled={pending} onClick={() => onNext(patch)}>Advance to Final Contract <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function FinalContractStep({ c, onSave, onNext, pending }:
  { c: Candidate; onSave: (p: Record<string, unknown>) => void; onNext: () => void; pending: boolean }) {
  const [status, setStatus] = useState<string>(c.final_contract_status ?? "not_sent");
  return (
    <div className="space-y-2">
      <Label htmlFor="cstatus" className="text-xs">Adobe Sign status (recorded manually)</Label>
      <Select id="cstatus" value={status} onChange={(e) => { setStatus(e.target.value); onSave({ final_contract_status: e.target.value }); }}>
        {CONTRACT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
      <Button className="w-full" disabled={pending || status !== "signed"} onClick={onNext}>
        Mark Contracted &amp; hand to academic team <ArrowRight className="h-4 w-4" />
      </Button>
      {status !== "signed" && <p className="text-[11px] text-muted-foreground">Set status to “Signed” to complete the handover.</p>}
    </div>
  );
}
