import { cn } from "@/lib/utils";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const text = name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <span className={cn(
      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
      className,
    )}>
      {text}
    </span>
  );
}
