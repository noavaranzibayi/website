import { History } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";
import { EmptyState } from "@/components/ui/state";

type AuditRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  ip: string | null;
  createdAt: Date;
  actor: { name: string; email: string } | null;
};

export default async function AuditLogTable({ rows }: { rows: AuditRow[] }) {
  const t = await getTranslations("auditLog");
  const format = await getFormatter();

  if (rows.length === 0) {
    return <EmptyState icon={History} title={t("empty")} className="py-16" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-navy-100 text-xs text-navy-400 dark:border-navy-800">
            <th className="px-4 py-3 text-start font-semibold">{t("columns.time")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.actor")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.action")}</th>
            <th className="px-2 py-3 text-start font-semibold">{t("columns.target")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("columns.ip")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-navy-50 last:border-0 dark:border-navy-800/60">
              <td className="whitespace-nowrap px-4 py-3 text-navy-500">
                {format.dateTime(row.createdAt, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-2 py-3 font-semibold text-navy-700 dark:text-navy-200">
                {row.actor?.name ?? t("system")}
              </td>
              <td className="px-2 py-3 text-navy-600 dark:text-navy-300">{row.action}</td>
              <td className="px-2 py-3 text-navy-400">
                {row.targetType}
                {row.targetId ? ` · ${row.targetId.slice(0, 10)}…` : ""}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-navy-400" dir="ltr">
                {row.ip ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
