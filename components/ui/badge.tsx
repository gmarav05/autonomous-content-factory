import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variant === "default"
          ? "border-transparent bg-secondary text-secondary-foreground"
          : "border-border/60 bg-transparent text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
