import { Monitor } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";
import { EmptyState } from "@/components/ui/state";

type SessionRow = { id: string; ip: string | null; userAgent: string | null; createdAt: Date; expires: Date };

export default async function UserSessionsPanel({ sessions }: { sessions: SessionRow[] }) {
  const t = await getTranslations("profile.sessions");
  const format = await getFormatter();

  if (sessions.length === 0) {
    return <EmptyState icon={Monitor} title={t("title")} className="py-10" />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 p-4 dark:border-navy-800"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-500 dark:bg-navy-800">
              <Monitor className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="max-w-xs truncate text-sm font-semibold text-navy-700 dark:text-navy-200">
                {s.userAgent ?? "—"}
              </p>
              <p className="text-xs text-navy-400" dir="ltr">
                {s.ip ?? "—"} · {format.dateTime(s.createdAt, { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
