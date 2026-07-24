"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export function DrawerContent({
  className,
  children,
  side = "start",
  ...props
}: DialogPrimitive.DialogContentProps & { side?: "start" | "end" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-[70] bg-navy-950/50 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "drawer-content fixed inset-y-0 z-[70] flex w-[85vw] max-w-xs flex-col bg-white shadow-2xl focus:outline-none dark:bg-navy-950",
          side === "start" ? "start-0" : "end-0",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute end-4 top-4 rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 dark:hover:bg-navy-800 dark:hover:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-navy-100 p-4 pe-12 dark:border-navy-800", className)} {...props} />;
}

export function DrawerTitle({ className, ...props }: DialogPrimitive.DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("text-base font-bold text-navy-800 dark:text-white", className)}
      {...props}
    />
  );
}
