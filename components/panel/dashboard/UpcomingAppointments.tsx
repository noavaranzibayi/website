import { getTranslations, getFormatter } from "next-intl/server";
import { CalendarClock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/state";

type UpcomingItem = {
  id: string;
  subject: string;
  confirmedDate: Date | null;
  user: { name: string } | null;
};

export default async function UpcomingAppointments({ items }: { items: UpcomingItem[] }) {
  const t = await getTranslations("dashboard.upcoming");
  const format = await getFormatter();

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-800 dark:text-white">{t("title")}</h3>
        <Link href="/panel/admin/appointments" className="text-xs font-semibold text-navy-500 hover:text-gold-500">
          {t("viewAll")}
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={CalendarClock} title={t("empty")} className="py-8" />
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/panel/admin/appointments/${item.id}`}
                className="flex items-center justify-between rounded-xl border border-navy-50 px-3 py-2.5 text-sm transition-colors hover:border-gold-200 hover:bg-gold-50/40 dark:border-navy-800 dark:hover:bg-navy-800"
              >
                <div>
                  <p className="font-semibold text-navy-700 dark:text-navy-100">{item.subject}</p>
                  <p className="text-xs text-navy-400">{item.user?.name}</p>
                </div>
                {item.confirmedDate && (
                  <span className="text-xs font-medium text-navy-500">
                    {format.dateTime(item.confirmedDate, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
