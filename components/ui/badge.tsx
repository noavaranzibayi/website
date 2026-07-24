import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200",
        success: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
        warning: "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        outline: "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
