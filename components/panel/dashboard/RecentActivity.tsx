import { getTranslations, getFormatter } from "next-intl/server";
import { History } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/state";

type ActivityItem = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  createdAt: Date;
  actor: { name: string; email: string } | null;
};

export default async function RecentActivity({ items }: { items: ActivityItem[] }) {
  const t = await getTranslations("dashboard.recentActivity");
  const tAudit = await getTranslations("auditLog");
  const format = await getFormatter();

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-800 dark:text-white">{t("title")}</h3>
        <Link href="/panel/admin/audit-log" className="text-xs font-semibold text-navy-500 hover:text-gold-500">
          {t("viewAll")}
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={History} title={t("empty")} className="py-8" />
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
              <div>
                <p className="text-navy-700 dark:text-navy-200">
                  <span className="font-semibold">{item.actor?.name ?? tAudit("system")}</span>{" "}
                  <span className="text-navy-400">{item.action}</span>
                </p>
                <p className="text-xs text-navy-400">{format.relativeTime(item.createdAt, new Date())}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
