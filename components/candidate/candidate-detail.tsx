"use client";
import { useState, useTransition } from "react";
import { ExternalLink, FileVideo, FileText, NotebookPen, Send } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar } from "@/components/ui/avatar";
import { updateDocument, addNote } from "@/lib/actions/candidates";
import { roleLabel, subjectLabel, levelLabel } from "@/lib/constants/roles";
import { formatDate, formatDateTime } from "@/lib/utils";
import { stage } from "@/lib/constants/stages";
import type { Candidate, CandidateDocument } from "@/types/database";

type EnrichedNote = { id: string; body: string; created_at: string; author_name: string };
type EnrichedTransition = { id: string; from_stage: number | null; to_stage: number; created_at: string; note: string | null; actor_name: string };

const DOC_STATUS = [
  { value: "not_submitted", label: "Not submitted", variant: "muted" },
  { value: "received", label: "Received / pending", variant: "warning" },
  { value: "approved", label: "Approved", variant: "success" },
  { value: "rejected", label: "Rejected", variant: "destructive" },
] as const;

export function CandidateDetail({ c, documents, notes, timeline, canManage }:
  { c: Candidate; documents: CandidateDocument[]; notes: EnrichedNote[]; timeline: EnrichedTransition[]; canManage: boolean }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Overview c={c} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsTab c={c} documents={documents} canManage={canManage} />
      </TabsContent>

      <TabsContent value="notes">
        <NotesTab candidateId={c.id} notes={notes} />
      </TabsContent>

      <TabsContent value="timeline">
        <TimelineTab timeline={timeline} />
      </TabsContent>
    </Tabs>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

function LinkButton({ href, icon: Icon, label }: { href: string | null; icon: any; label: string }) {
  if (!href) return (
    <span className="inline-flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
      <Icon className="h-4 w-4" /> {label} — not provided
    </span>
  );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent">
      <Icon className="h-4 w-4" /> {label} <ExternalLink className="h-3 w-3 text-muted-foreground" />
    </a>
  );
}

function Overview({ c }: { c: Candidate }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">Details</h3>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Email">{c.email}</Field>
          <Field label="Phone">{c.phone ?? "—"}</Field>
          <Field label="Role type">{roleLabel(c.role_type)}</Field>
          <Field label="Subject area">{subjectLabel(c.subject_area)}</Field>
          <Field label="Level">{levelLabel(c.level)}</Field>
          <Field label="Also suitable for">
            {c.suitable_roles?.length
              ? <div className="flex flex-wrap gap-1">{c.suitable_roles.map((r) => <Badge key={r} variant="muted">{roleLabel(r)}</Badge>)}</div>
              : "—"}
          </Field>
        </dl>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">Interview</h3>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Date">{formatDate(c.interview_date)}</Field>
          <Field label="Rating"><StarRating value={c.rating} readOnly /></Field>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={c.teams_recording_url} icon={FileVideo} label="Recording" />
          <LinkButton href={c.teams_transcript_url} icon={FileText} label="Transcript" />
          <LinkButton href={c.teams_notes_url} icon={NotebookPen} label="Notes" />
        </div>
        {c.interview_notes && (
          <p className="mt-4 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{c.interview_notes}</p>
        )}
      </div>

      {c.decision && (
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">Director decision</h3>
          <Badge variant={c.decision === "approved" ? "success" : "destructive"}>{c.decision}</Badge>
          {c.director_notes && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{c.director_notes}</p>}
          <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(c.decided_at)}</p>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">Contract</h3>
        <dl className="grid grid-cols-2 gap-4">
          <Field label="Final status"><Badge variant="muted">{c.final_contract_status.replace("_", " ")}</Badge></Field>
        </dl>
        {c.contract_notes && <p className="mt-3 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{c.contract_notes}</p>}
      </div>
    </div>
  );
}

function DocumentsTab({ c, documents, canManage }: { c: Candidate; documents: CandidateDocument[]; canManage: boolean }) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        The role-specific checklist is created when the candidate reaches Stage 7 (Document Collection).
      </div>
    );
  }
  return (
    <div className="divide-y rounded-2xl border bg-card">
      {documents.map((d) => <DocumentRow key={d.id} c={c} d={d} canManage={canManage} />)}
    </div>
  );
}

function DocumentRow({ c, d, canManage }: { c: Candidate; d: CandidateDocument; canManage: boolean }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(d.status);
  const meta = DOC_STATUS.find((s) => s.value === status)!;
  return (
    <div className="flex flex-wrap items-center gap-3 p-3.5">
      <span className="flex-1 text-sm">{d.label}</span>
      {canManage ? (
        <Select value={status} disabled={pending} className="w-48"
          onChange={(e) => { const v = e.target.value as any; setStatus(v); start(() => updateDocument(d.id, c.id, v).then(() => {})); }}>
          {DOC_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      ) : (
        <Badge variant={meta.variant as any}>{meta.label}</Badge>
      )}
    </div>
  );
}

function NotesTab({ candidateId, notes }: { candidateId: string; notes: EnrichedNote[] }) {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  function post() {
    if (!body.trim()) return;
    start(async () => { await addNote(candidateId, body); setBody(""); });
  }
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add an internal note (visible to staff only)…" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" disabled={pending || !body.trim()} onClick={post}><Send className="h-4 w-4" /> Add note</Button>
        </div>
      </div>
      <div className="space-y-3">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-2xl border bg-card p-4">
            <Avatar name={n.author_name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{n.author_name}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(n.created_at)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ timeline }: { timeline: EnrichedTransition[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <ol className="relative space-y-5 border-l pl-6">
        {timeline.map((t) => (
          <li key={t.id} className="relative">
            <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-card" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t.from_stage ? `Stage ${t.from_stage} → ${t.to_stage}` : `Created at Stage ${t.to_stage}`}: {stage(t.to_stage).name}
              </span>
              <span className="text-xs text-muted-foreground">{formatDateTime(t.created_at)}</span>
            </div>
            <p className="text-xs text-muted-foreground">by {t.actor_name}{t.note ? ` — ${t.note}` : ""}</p>
          </li>
        ))}
        {timeline.length === 0 && <li className="text-sm text-muted-foreground">No activity recorded.</li>}
      </ol>
    </div>
  );
}
