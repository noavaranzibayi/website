import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-navy-200 bg-white px-3.5 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:focus:ring-gold-900/30",
          invalid && "border-red-400 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
