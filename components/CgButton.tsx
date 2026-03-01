import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CgButton({
  className,
  ...props
}: ButtonProps) {
  return <Button className={cn(className)} {...props} />;
}
