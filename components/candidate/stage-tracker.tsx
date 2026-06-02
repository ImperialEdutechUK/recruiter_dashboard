import { Check } from "lucide-react";
import { STAGES } from "@/lib/constants/stages";
import { cn } from "@/lib/utils";

export function StageTracker({ current }: { current: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-start gap-0 py-2">
        {STAGES.map((s, i) => {
          const done = s.n < current;
          const active = s.n === current;
          return (
            <div key={s.n} className="flex items-start">
              <div className="flex w-24 flex-col items-center text-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}>
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </div>
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
    </div>
  );
}
