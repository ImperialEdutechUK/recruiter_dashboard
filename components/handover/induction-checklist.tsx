"use client";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleInduction } from "@/lib/actions/candidates";
import type { InductionTask } from "@/types/database";

export function InductionChecklist({ candidateId, tasks }: { candidateId: string; tasks: InductionTask[] }) {
  const [items, setItems] = useState(tasks);
  const [pending, start] = useTransition();
  const done = items.filter((t) => t.is_complete).length;

  function toggle(id: string, next: boolean) {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, is_complete: next } : t)));
    start(() => toggleInduction(id, candidateId, next).then(() => {}));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Induction</span><span>{done}/{items.length} complete</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((t) => (
          <li key={t.id}>
            <button
              disabled={pending}
              onClick={() => toggle(t.id, !t.is_complete)}
              className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left text-sm hover:bg-accent disabled:opacity-60"
            >
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded border",
                t.is_complete ? "border-success bg-success text-success-foreground" : "border-border",
              )}>
                {t.is_complete && <Check className="h-3 w-3" />}
              </span>
              <span className={cn(t.is_complete && "text-muted-foreground line-through")}>{t.label}</span>
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted-foreground">No induction tasks.</li>}
      </ul>
    </div>
  );
}
