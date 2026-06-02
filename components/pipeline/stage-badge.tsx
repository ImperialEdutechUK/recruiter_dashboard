import { stage } from "@/lib/constants/stages";

export function StageBadge({ n, withNumber = true }: { n: number; withNumber?: boolean }) {
  const s = stage(n);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold"
      style={{ backgroundColor: `${s.color}14`, color: s.color }}
    >
      {withNumber && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: s.color }}>{n}</span>
      )}
      {s.short}
    </span>
  );
}
