"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Search, List, CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";

export default function AppointmentsFilters({
  basePath,
  initialQuery,
  initialStatus,
  view,
}: {
  basePath: string;
  initialQuery?: string;
  initialStatus?: string;
  view: "list" | "calendar";
}) {
  const t = useTranslations("panel.table");
  const tAppt = useTranslations("appointments");
  const tStatus = useTranslations("appointments.status");
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? "");
  const [, startTransition] = useTransition();

  function navigate(next: { q?: string; status?: string; view?: string }) {
    const params = new URLSearchParams();
    const query = next.q ?? q;
    const status = next.status ?? initialStatus ?? "";
    const nextView = next.view ?? view;
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    if (nextView !== "list") params.set("view", nextView);
    startTransition(() => {
      router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    navigate({ q });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <form onSubmit={handleSubmit} className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-navy-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tAppt("searchPlaceholder")}
          className="ps-9"
        />
      </form>

      <Select value={initialStatus ?? "ALL"} onValueChange={(v) => navigate({ status: v === "ALL" ? "" : v })}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
          <SelectItem value="PENDING">{tStatus("PENDING")}</SelectItem>
          <SelectItem value="CONFIRMED">{tStatus("CONFIRMED")}</SelectItem>
          <SelectItem value="RESCHEDULED">{tStatus("RESCHEDULED")}</SelectItem>
          <SelectItem value="COMPLETED">{tStatus("COMPLETED")}</SelectItem>
          <SelectItem value="CANCELLED">{tStatus("CANCELLED")}</SelectItem>
          <SelectItem value="REJECTED">{tStatus("REJECTED")}</SelectItem>
          <SelectItem value="NO_SHOW">{tStatus("NO_SHOW")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 rounded-xl border border-navy-200 p-1 dark:border-navy-700">
        <button
          type="button"
          onClick={() => navigate({ view: "list" })}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            view === "list" ? "bg-navy-800 text-white dark:bg-gold-400 dark:text-navy-900" : "text-navy-500"
          )}
        >
          <List className="h-3.5 w-3.5" />
          {tAppt("views.list")}
        </button>
        <button
          type="button"
          onClick={() => navigate({ view: "calendar" })}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            view === "calendar" ? "bg-navy-800 text-white dark:bg-gold-400 dark:text-navy-900" : "text-navy-500"
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {tAppt("views.calendar")}
        </button>
      </div>
    </div>
  );
}
