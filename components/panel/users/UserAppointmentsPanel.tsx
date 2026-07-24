import { CalendarClock } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/state";
import { AppointmentStatusBadge } from "@/components/panel/shared/Badges";
import type { AppointmentStatus } from "@/app/generated/prisma/client";

type AppointmentRow = { id: string; subject: string; requestedDate: Date; status: AppointmentStatus };

export default async function UserAppointmentsPanel({ items }: { items: AppointmentRow[] }) {
  const t = await getTranslations("appointments");
  const format = await getFormatter();

  if (items.length === 0) {
    return <EmptyState icon={CalendarClock} title={t("empty.title")} description={t("empty.description")} className="py-10" />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/panel/admin/appointments/${item.id}`}
            className="flex items-center justify-between rounded-xl border border-navy-100 p-3 text-sm transition-colors hover:border-gold-200 hover:bg-gold-50/40 dark:border-navy-800 dark:hover:bg-navy-800"
          >
            <div>
              <p className="font-semibold text-navy-700 dark:text-navy-200">{item.subject}</p>
              <p className="text-xs text-navy-400">
                {format.dateTime(item.requestedDate, { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
            <AppointmentStatusBadge status={item.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
