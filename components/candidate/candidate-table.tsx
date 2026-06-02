"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { ColoredAvatar } from "@/components/ui/colored-avatar";
import { StageBadge } from "@/components/pipeline/stage-badge";
import { BrandPill } from "@/components/brand/brand-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export interface TableRow {
  id: string;
  full_name: string;
  email: string;
  role_label: string;
  brands: { name: string; color: string }[];
  subject_label: string;
  level_label: string;
  current_stage: number;
  substatus: string | null;
  updated_at: string;
  owner_name: string;
}

export function CandidateTable({ rows, pageSize = 8, toolbar }:
  { rows: TableRow[]; pageSize?: number; toolbar?: React.ReactNode }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return rows;
    return rows.filter((r) =>
      `${r.full_name} ${r.email} ${r.role_label} ${r.subject_label}`.toLowerCase().includes(needle));
  }, [rows, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  const allSliceSelected = slice.length > 0 && slice.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSliceSelected) {
      setSelected((prev) => { const n = new Set(prev); slice.forEach((r) => n.delete(r.id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); slice.forEach((r) => n.add(r.id)); return n; });
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function exportCsv() {
    const toExport = someSelected ? filtered.filter((r) => selected.has(r.id)) : filtered;
    const head = ["Name", "Email", "Role", "Brands", "Subject", "Level", "Stage", "Updated", "Owner"];
    const lines = toExport.map((r) =>
      [r.full_name, r.email, r.role_label, r.brands.map((b) => b.name).join(" / "),
       r.subject_label, r.level_label, r.current_stage, formatDate(r.updated_at), r.owner_name]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const bom = "\uFEFF";
    const blob = new Blob([bom + [head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates${someSelected ? `-${toExport.length}-selected` : ""}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search candidates…" className="pl-9" />
          </div>
          {someSelected && (
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          <Button variant="outline" size="md" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            {someSelected ? `Export ${selected.size}` : "Export"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y bg-muted/30 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSliceSelected} onChange={toggleAll}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
              </th>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Role Type</th>
              <th className="px-4 py-3">Brand(s)</th>
              <th className="px-4 py-3">Subject / Specialism</th>
              <th className="px-4 py-3">Current Stage</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.id} className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${selected.has(r.id) ? "bg-primary-soft/50" : ""}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ColoredAvatar name={r.full_name} size={36} />
                    <div className="min-w-0">
                      <Link href={`/candidates/${r.id}`} className="font-semibold hover:text-primary">{r.full_name}</Link>
                      <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{r.role_label}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.brands.map((b, i) => <BrandPill key={i} name={b.name} color={b.color} />)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>{r.subject_label}</div>
                  <div className="text-xs text-muted-foreground">{r.level_label}</div>
                </td>
                <td className="px-4 py-3">
                  <StageBadge n={r.current_stage} />
                  {r.substatus && <div className="mt-1 text-xs text-muted-foreground">{r.substatus}</div>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(r.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ColoredAvatar name={r.owner_name} size={26} />
                    <span className="text-xs">{r.owner_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/candidates/${r.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link href={`/candidates/${r.id}`} aria-label="More" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                      <MoreVertical className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No candidates found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4 text-sm text-muted-foreground">
        <span>
          {filtered.length === 0 ? "No results" :
            `Showing ${(current - 1) * pageSize + 1} to ${Math.min(current * pageSize, filtered.length)} of ${filtered.length} candidates`}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}
            className="rounded-md border p-1.5 disabled:opacity-40 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
          {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
            const n = i + 1;
            return (
              <button key={n} onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-md border text-sm ${current === n ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                {n}
              </button>
            );
          })}
          {pages > 5 && <span className="px-1">…</span>}
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={current === pages}
            className="rounded-md border p-1.5 disabled:opacity-40 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
