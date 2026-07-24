import { History } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";
import { EmptyState } from "@/components/ui/state";

type ActivityRow = {
  id: string;
  action: string;
  targetType: string;
  createdAt: Date;
  actor: { name: string; email: string } | null;
};

export default async function UserActivityPanel({ items }: { items: ActivityRow[] }) {
  const t = await getTranslations("auditLog");
  const format = await getFormatter();

  if (items.length === 0) {
    return <EmptyState icon={History} title={t("empty")} className="py-10" />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 rounded-xl border border-navy-100 p-3 text-sm dark:border-navy-800">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
          <div>
            <p className="text-navy-700 dark:text-navy-200">
              <span className="font-semibold">{item.actor?.name ?? t("system")}</span>{" "}
              <span className="text-navy-400">{item.action}</span>
            </p>
            <p className="text-xs text-navy-400">
              {format.dateTime(item.createdAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
