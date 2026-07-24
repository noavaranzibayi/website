"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-navy-800 text-white hover:bg-navy-700 focus-visible:ring-navy-200 dark:bg-navy-100 dark:text-navy-900 dark:hover:bg-white",
        gold: "bg-gold-400 text-navy-900 hover:bg-gold-300 focus-visible:ring-gold-200 shadow-sm",
        outline:
          "border border-navy-200 bg-transparent text-navy-700 hover:bg-navy-50 focus-visible:ring-navy-100 dark:border-navy-700 dark:text-navy-200 dark:hover:bg-navy-800",
        ghost:
          "bg-transparent text-navy-600 hover:bg-navy-50 focus-visible:ring-navy-100 dark:text-navy-300 dark:hover:bg-navy-800",
        destructive: "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-200",
        link: "text-navy-700 underline-offset-4 hover:underline dark:text-navy-200",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 shrink-0 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    // Radix's Slot requires exactly one child element, so asChild usage
    // (always a single Link/element, never a loading state) skips the
    // spinner wrapper that the plain <button> case renders.
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
