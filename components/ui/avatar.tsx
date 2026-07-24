"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";

export function Avatar({ className, ...props }: AvatarPrimitive.AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage(props: AvatarPrimitive.AvatarImageProps) {
  return <AvatarPrimitive.Image className="h-full w-full object-cover" {...props} />;
}

export function AvatarFallback({ className, ...props }: AvatarPrimitive.AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center text-xs font-bold text-navy-600 dark:text-navy-200",
        className
      )}
      {...props}
    />
  );
}
