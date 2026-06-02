"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, onChange, readOnly = false }:
  { value: number | null; onChange?: (v: number) => void; readOnly?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn("p-0.5", !readOnly && "hover:scale-110 transition-transform")}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star className={cn("h-4 w-4", (value ?? 0) >= n ? "fill-warning text-warning" : "text-muted-foreground/40")} />
        </button>
      ))}
    </div>
  );
}
