import { getTranslations, getFormatter } from "next-intl/server";
import { AppointmentStatusBadge } from "@/components/panel/shared/Badges";
import type { AppointmentStatus } from "@/app/generated/prisma/client";

type HistoryItem = {
  id: string;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus;
  note: string | null;
  createdAt: Date;
  changedBy: { name: string } | null;
};

export default async function HistoryTimeline({ items }: { items: HistoryItem[] }) {
  const t = await getTranslations("appointments.detail");
  const format = await getFormatter();

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-navy-800 dark:text-white">{t("historyTitle")}</h3>
      <ul className="flex flex-col gap-3 border-s-2 border-navy-100 ps-4 dark:border-navy-800">
        {items.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -start-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold-400" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <AppointmentStatusBadge status={item.toStatus} />
              <span className="text-navy-400">
                {item.changedBy?.name ?? "—"} ·{" "}
                {format.dateTime(item.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {item.note && <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{item.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
