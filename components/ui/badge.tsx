import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "muted" | "success" | "warning" | "destructive";
const styles: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-border text-foreground",
  muted: "bg-muted text-muted-foreground",
  success: "bg-success/12 text-success border border-success/25",
  warning: "bg-warning/12 text-warning border border-warning/25",
  destructive: "bg-destructive/10 text-destructive border border-destructive/25",
};

export function Badge({ className, variant = "default", ...props }:
  React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant], className)} {...props} />
  );
}
