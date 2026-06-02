import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive" | "success" | "subtle";
type Size = "sm" | "md" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-border bg-card hover:bg-accent",
  ghost: "hover:bg-accent",
  subtle: "bg-muted text-foreground hover:bg-accent",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant], sizes[size], className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
