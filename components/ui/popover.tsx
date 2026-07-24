"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "dropdown-content z-[70] rounded-2xl border border-navy-100 bg-white p-4 shadow-xl ring-1 ring-black/5 dark:border-navy-700 dark:bg-navy-900",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
