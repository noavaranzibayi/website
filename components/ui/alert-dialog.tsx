"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/cn";
import { buttonVariants } from "./button";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-[70] bg-navy-950/50 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content
        className={cn(
          "dialog-content fixed start-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md rounded-2xl border border-navy-100 bg-white p-6 shadow-2xl focus:outline-none dark:border-navy-800 dark:bg-navy-900",
          className
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-bold text-navy-800 dark:text-white", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm leading-6 text-navy-500 dark:text-navy-400", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-wrap items-center justify-end gap-3", className)} {...props} />;
}

export function AlertDialogCancel({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export function AlertDialogAction({
  className,
  variant = "destructive",
  ...props
}: AlertDialogPrimitive.AlertDialogActionProps & { variant?: "destructive" | "primary" }) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
