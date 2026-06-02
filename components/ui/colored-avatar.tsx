import { cn } from "@/lib/utils";

const PALETTE = [
  ["#dbeafe", "#1d4ed8"], ["#dcfce7", "#15803d"], ["#fef3c7", "#b45309"],
  ["#ede9fe", "#6d28d9"], ["#fce7f3", "#be185d"], ["#cffafe", "#0e7490"],
  ["#ffedd5", "#c2410c"], ["#e0e7ff", "#4338ca"],
];

function pick(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function ColoredAvatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const [bg, fg] = pick(name || "?");
  const text = (name || "?").split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", className)}
      style={{ width: size, height: size, backgroundColor: bg, color: fg, fontSize: size * 0.36 }}
    >
      {text}
    </span>
  );
}
