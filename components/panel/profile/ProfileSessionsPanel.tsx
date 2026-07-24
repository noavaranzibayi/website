"use client";

import { useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { toast } from "sonner";
import { Monitor, LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { revokeSessionAction, revokeAllOtherSessionsAction } from "@/lib/actions/profile";

type SessionRow = { id: string; sessionToken: string; ip: string | null; userAgent: string | null; createdAt: string };

export default function ProfileSessionsPanel({
  sessions,
  currentSessionToken,
}: {
  sessions: SessionRow[];
  currentSessionToken?: string;
}) {
  const t = useTranslations("profile.sessions");
  const format = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRevoke(id: string) {
    startTransition(async () => {
      const result = await revokeSessionAction(id);
      toast[result.ok ? "success" : "error"](result.ok ? t("revokedToast") : "Error");
      if (result.ok) router.refresh();
    });
  }

  function handleRevokeAll() {
    startTransition(async () => {
      const result = await revokeAllOtherSessionsAction();
      toast[result.ok ? "success" : "error"](result.ok ? t("revokedToast") : "Error");
      if (result.ok) router.refresh();
    });
  }

  const others = sessions.filter((s) => s.sessionToken !== currentSessionToken);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-500 dark:text-navy-400">{t("description")}</p>
        {others.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleRevokeAll} disabled={isPending}>
            <LogOut className="h-4 w-4" />
            {t("revokeAll")}
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={Monitor} title={t("title")} className="py-10" />
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => {
            const isCurrent = s.sessionToken === currentSessionToken;
            return (
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
                      {s.userAgent ?? "—"} {isCurrent && <span className="text-gold-500">· {t("thisDevice")}</span>}
                    </p>
                    <p className="text-xs text-navy-400" dir="ltr">
                      {s.ip ?? "—"} ·{" "}
                      {format.dateTime(new Date(s.createdAt), { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(s.id)}
                    disabled={isPending}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t("revoke")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
