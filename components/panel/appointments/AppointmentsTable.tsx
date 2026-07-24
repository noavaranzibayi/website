"use client";

import { useTranslations, useFormatter } from "next-intl";
import { CalendarClock, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/state";
import { AppointmentStatusBadge } from "@/components/panel/shared/Badges";
import type { AppointmentStatus, AppointmentType } from "@/app/generated/prisma/client";

export type AppointmentRow = {
  id: string;
  subject: string;
  requestedDate: Date;
  confirmedDate: Date | null;
  type: AppointmentType;
  status: AppointmentStatus;
  contactPhone: string;
  user: { id: string; name: string; email: string; image: string | null } | null;
  assignedAdmin: { id: string; name: string } | null;
};

export default function AppointmentsTable({ rows }: { rows: AppointmentRow[] }) {
  const t = useTranslations("appointments");
  const format = useFormatter();

  if (rows.length === 0) {
    return <EmptyState icon={CalendarClock} title={t("empty.title")} description={t("empty.description")} className="py-16" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-navy-100 text-xs text-navy-400 dark:border-navy-800">
            <th className="px-4 py-3 text-start font-semibold">{t("columns.subject")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.requester")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.date")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.type")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.assignee")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.status")}</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const date = row.confirmedDate ?? row.requestedDate;
            const initials = (row.user?.name ?? row.contactPhone).slice(0, 2).toUpperCase();
            return (
              <tr
                key={row.id}
                className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40 dark:border-navy-800/60 dark:hover:bg-navy-900/40"
              >
                <td className="max-w-[220px] truncate px-4 py-3 font-semibold text-navy-800 dark:text-white">
                  <Link href={`/panel/admin/appointments/${row.id}`}>{row.subject}</Link>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-navy-700 dark:text-navy-200">{row.user?.name ?? row.contactPhone}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-navy-500">
                  {format.dateTime(date, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-navy-500">{t(`type.${row.type}`)}</td>
                <td className="whitespace-nowrap px-2 py-3 text-navy-500">
                  {row.assignedAdmin?.name ?? t("unassigned")}
                </td>
                <td className="px-2 py-3">
                  <AppointmentStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/panel/admin/appointments/${row.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
