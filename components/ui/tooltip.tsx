"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, sideOffset = 8, ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "dropdown-content z-[80] rounded-lg bg-navy-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-navy-100 dark:text-navy-900",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
