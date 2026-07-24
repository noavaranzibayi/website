import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:focus:ring-gold-900/30",
          invalid && "border-red-400 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
