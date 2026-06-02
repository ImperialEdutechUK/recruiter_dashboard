import { STAGES } from "@/lib/constants/stages";

export function StageBar({ counts }: { counts: Record<number, number> }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-start">
        {STAGES.map((s, i) => (
          <div key={s.n} className="flex items-start">
            <div className="flex w-[104px] flex-col items-center px-1 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: s.color }}>{s.n}</span>
              <span className="mt-2 text-[11px] font-medium leading-tight text-muted-foreground">{s.short}</span>
              <span className="mt-1 text-base font-bold text-foreground">{counts[s.n] ?? 0}</span>
            </div>
            {i < STAGES.length - 1 && <div className="mt-[18px] h-px w-6 border-t-2 border-dashed border-border" />}
          </div>
        ))}
      </div>
    </div>
  );
}
