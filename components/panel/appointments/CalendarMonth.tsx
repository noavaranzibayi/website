"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export default function CalendarMonth({
  year,
  monthIndex0,
  counts,
  selectedDate,
  basePath,
}: {
  year: number;
  monthIndex0: number;
  counts: Record<string, number>;
  selectedDate?: string;
  basePath: string;
}) {
  const locale = useLocale();
  const router = useRouter();

  const current = new Date(year, monthIndex0, 1);
  const gridStart = startOfWeek(startOfMonth(current), { weekStartsOn: 6 });
  const gridEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 6 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return weekdayFormatter.format(d);
  });

  function go(next: Date) {
    router.push(`${basePath}?view=calendar&month=${format(next, "yyyy-MM")}`);
  }

  function selectDay(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    router.push(`${basePath}?view=calendar&month=${format(current, "yyyy-MM")}&date=${key}`);
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(subMonths(current, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 hover:bg-navy-50 dark:border-navy-700 dark:hover:bg-navy-800"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-navy-800 dark:text-white">{monthFormatter.format(current)}</span>
        <button
          type="button"
          onClick={() => go(addMonths(current, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 hover:bg-navy-50 dark:border-navy-700 dark:hover:bg-navy-800"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-navy-400">
        {weekdayLabels.map((label, i) => (
          <div key={i} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = counts[key] ?? 0;
          const inMonth = isSameMonth(day, current);
          const today = isToday(day);
          const selected = selectedDate ? isSameDay(day, new Date(`${selectedDate}T00:00:00`)) : false;

          return (
            <button
              key={key}
              type="button"
              onClick={() => selectDay(day)}
              disabled={!inMonth}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs transition-colors",
                !inMonth && "pointer-events-none opacity-30",
                selected
                  ? "bg-navy-800 text-white dark:bg-gold-400 dark:text-navy-900"
                  : today
                    ? "bg-navy-50 font-bold text-navy-800 dark:bg-navy-800 dark:text-white"
                    : "text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800"
              )}
            >
              <span>{day.getDate()}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    selected ? "bg-white dark:bg-navy-900" : "bg-gold-400"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
