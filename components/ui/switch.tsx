"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full bg-navy-200 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-gold-100 data-[state=checked]:bg-navy-800 dark:bg-navy-700 dark:data-[state=checked]:bg-gold-400",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px] rtl:data-[state=checked]:-translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}
