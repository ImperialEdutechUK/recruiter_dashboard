"use client";
import { useMemo, useState } from "react";
import { Search, LayoutList, KanbanSquare } from "lucide-react";
import { CandidateCard } from "./candidate-card";
import { StageBadge } from "./stage-badge";
import { NewCandidateDialog } from "./new-candidate-dialog";
import { BrandPill } from "@/components/brand/brand-pill";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn, daysSince } from "@/lib/utils";
import { STAGES } from "@/lib/constants/stages";
import { roleLabel, subjectLabel } from "@/lib/constants/roles";
import Link from "next/link";
import type { Candidate, Brand } from "@/types/database";

export function PipelineView({ candidates, brands, canCreate }:
  { candidates: Candidate[]; brands: Brand[]; canCreate: boolean }) {
  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands]);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [stageF, setStageF] = useState("all");
  const [view, setView] = useState<"list" | "kanban">("list");

  const filtered = candidates.filter((c) => {
    const hay = `${c.full_name} ${c.email} ${roleLabel(c.role_type)}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (brand !== "all" && c.primary_brand_id !== brand) return false;
    if (stageF !== "all" && c.current_stage !== Number(stageF)) return false;
    return true;
  });
  const active = filtered.filter((c) => c.decision !== "rejected");
  const rejected = filtered.filter((c) => c.decision === "rejected");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">{active.length} active candidate{active.length !== 1 && "s"}</p>
        </div>
        {canCreate && <NewCandidateDialog brands={brands} />}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, role…" className="pl-9" />
        </div>
        <Select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-auto">
          <option value="all">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select value={stageF} onChange={(e) => setStageF(e.target.value)} className="w-auto">
          <option value="all">All stages</option>
          {STAGES.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
        </Select>
        <div className="flex overflow-hidden rounded-md border">
          <button onClick={() => setView("list")} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-sm", view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
            <LayoutList className="h-4 w-4" /> List
          </button>
          <button onClick={() => setView("kanban")} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-sm", view === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
            <KanbanSquare className="h-4 w-4" /> Board
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Candidate</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Brand</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 text-right font-medium">Days</th>
              </tr>
            </thead>
            <tbody>
              {active.map((c) => {
                const b = brandMap[c.primary_brand_id];
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">{c.full_name}</Link>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{roleLabel(c.role_type)}</div>
                      <div className="text-xs text-muted-foreground">{subjectLabel(c.subject_area)}</div>
                    </td>
                    <td className="px-4 py-3">{b && <BrandPill name={b.name} color={b.color} />}</td>
                    <td className="px-4 py-3"><StageBadge n={c.current_stage} /></td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{daysSince(c.updated_at)}d</td>
                  </tr>
                );
              })}
              {active.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No candidates match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {STAGES.map((s) => {
            const items = active.filter((c) => c.current_stage === s.n);
            return (
              <div key={s.n} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold">{s.n}. {s.name}</span>
                  <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/30 p-2 min-h-[60px]">
                  {items.map((c) => (
                    <CandidateCard key={c.id} c={c} brand={brandMap[c.primary_brand_id]} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejected.length > 0 && (
        <details className="rounded-2xl border bg-card">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground">
            Rejected candidates ({rejected.length})
          </summary>
          <div className="grid gap-2 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {rejected.map((c) => <CandidateCard key={c.id} c={c} brand={brandMap[c.primary_brand_id]} />)}
          </div>
        </details>
      )}
    </div>
  );
}
