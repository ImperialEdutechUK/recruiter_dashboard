import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "purple";
const tones: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-violet-50 text-violet-600",
};

export function StatCard({ label, value, href, linkText, icon: Icon, tone }:
  { label: string; value: number | string; href: string; linkText: string; icon: any; tone: Tone }) {
  return (
    <div className="card-shadow flex items-start gap-4 rounded-2xl border bg-card p-5">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tones[tone])}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-3xl font-bold tracking-tight">{value}</p>
        <Link href={href} className="mt-1 inline-block text-sm font-medium text-primary hover:underline">{linkText}</Link>
      </div>
    </div>
  );
}
