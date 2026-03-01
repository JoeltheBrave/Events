import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CgCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors hover:border-sky-300 dark:hover:border-sky-600",
        className
      )}
      {...props}
    />
  );
}
