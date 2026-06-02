import Link from "next/link";
import { Mail } from "lucide-react";
import { StageBadge } from "./stage-badge";
import { BrandPill } from "@/components/brand/brand-pill";
import { roleLabel, subjectLabel } from "@/lib/constants/roles";
import { daysSince } from "@/lib/utils";
import type { Candidate, Brand } from "@/types/database";

export function CandidateCard({ c, brand, extraBrands = [], compact = false }:
  { c: Candidate; brand?: Brand; extraBrands?: Brand[]; compact?: boolean }) {
  const days = daysSince(c.updated_at);
  return (
    <Link
      href={`/candidates/${c.id}`}
      className="block rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{c.full_name}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />{c.email}
          </p>
        </div>
        {!compact && <StageBadge n={c.current_stage} />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{roleLabel(c.role_type)}</span>
        <span>·</span>
        <span>{subjectLabel(c.subject_area)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {brand && <BrandPill name={brand.name} color={brand.color} />}
        {extraBrands.map((b) => <BrandPill key={b.id} name={b.name} color={b.color} />)}
        <span className="ml-auto text-[11px] text-muted-foreground">{days}d in stage</span>
      </div>
    </Link>
  );
}
