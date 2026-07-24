import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800 dark:text-navy-500">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-navy-700 dark:text-navy-100">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-navy-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-navy-700 dark:text-navy-100">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-navy-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
