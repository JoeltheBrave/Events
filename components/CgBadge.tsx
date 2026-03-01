import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CgBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & BadgeProps) {
  return <Badge className={cn("font-medium", className)} {...props} />;
}
