import * as React from "react";
import { cn } from "@/lib/utils";

export function CgChip({
  className,
  active,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-sky-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600",
        className
      )}
      {...props}
    />
  );
}
