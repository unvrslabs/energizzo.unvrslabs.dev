import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/60 px-2.5 py-0.5 text-xs font-semibold transition-colors",
        className,
      )}
      {...props}
    />
  );
}
