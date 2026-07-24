import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "navy",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "navy" | "gold" | "lime" | "red";
}) {
  const accentClasses = {
    navy: "bg-navy-800 text-gold-300",
    gold: "bg-gold-400/15 text-gold-600 dark:text-gold-300",
    lime: "bg-lime-400/15 text-lime-700 dark:text-lime-300",
    red: "bg-red-50 text-red-500 dark:bg-red-900/20",
  }[accent];

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentClasses)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-extrabold text-navy-800 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-navy-400">{label}</p>
    </div>
  );
}
