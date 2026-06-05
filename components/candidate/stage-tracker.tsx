"use client";
import { useTransition } from "react";
import { Check } from "lucide-react";
import { STAGES, stage as stageInfo } from "@/lib/constants/stages";
import { advanceStage } from "@/lib/actions/candidates";
import { cn } from "@/lib/utils";

export function StageTracker({
  current,
  candidateId,
  editable = false,
}: {
  current: number;
  candidateId?: string;
  editable?: boolean;
}) {
  const [pending, start] = useTransition();

  function go(n: number) {
    if (!editable || !candidateId || n === current || pending) return;
    const ok = window.confirm(
      `Move this candidate to Stage ${n} — ${stageInfo(n).name}?\n\nThis is logged in the Timeline.`,
    );
    if (!ok) return;
    start(async () => {
      await advanceStage(candidateId, n, "Stage changed from tracker");
    });
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-start gap-0 py-2">
        {STAGES.map((s, i) => {
          const done = s.n < current;
          const active = s.n === current;
          const circle = (
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
              done && "border-success bg-success text-success-foreground",
              active && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
              !done && !active && "border-border bg-card text-muted-foreground",
              editable && !active && "group-hover:ring-4 group-hover:ring-primary/20 cursor-pointer",
            )}>
              {done ? <Check className="h-4 w-4" /> : s.n}
            </div>
          );
          return (
            <div key={s.n} className="flex items-start">
              <div className="flex w-24 flex-col items-center text-center">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => go(s.n)}
                    disabled={pending || active}
                    className="group flex flex-col items-center text-center disabled:cursor-default"
                    title={active ? "Current stage" : `Move to Stage ${s.n}: ${s.name}`}
                  >
                    {circle}
                  </button>
                ) : (
                  circle
                )}
                <span className={cn(
                  "mt-1.5 text-[10px] leading-tight",
                  active ? "font-semibold text-foreground" : "text-muted-foreground",
                )}>
                  {s.name}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn("mt-4 h-0.5 w-6", s.n < current ? "bg-success" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
      {editable && (
        <p className="mt-1 text-xs text-muted-foreground">
          Click any stage circle to move this candidate there — forwards or backwards.
        </p>
      )}
    </div>
  );
}
