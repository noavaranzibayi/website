"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-navy-300 bg-white outline-none transition-colors focus-visible:ring-4 focus-visible:ring-gold-100 data-[state=checked]:border-navy-800 data-[state=checked]:bg-navy-800 data-[state=indeterminate]:border-navy-800 data-[state=indeterminate]:bg-navy-800 dark:border-navy-600 dark:bg-navy-900",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        {props.checked === "indeterminate" ? (
          <Minus className="h-3 w-3" />
        ) : (
          <Check className="h-3 w-3" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
