"use client";

import { useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Bell, Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { cn } from "@/lib/cn";

export type NotificationRow = { id: string; title: string; body: string; isRead: boolean; createdAt: string };

export default function NotificationsList({ items }: { items: NotificationRow[] }) {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unreadCount = items.filter((i) => !i.isRead).length;

  function markOne(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  if (items.length === 0) {
    return <EmptyState icon={Bell} title={t("empty")} className="py-16" />;
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex justify-end p-4 pb-0">
          <Button size="sm" variant="outline" onClick={markAll} disabled={isPending}>
            <Check className="h-4 w-4" />
            {t("markAllRead")}
          </Button>
        </div>
      )}
      <ul className="divide-y divide-navy-50 dark:divide-navy-800/60">
        {items.map((item) => (
          <li key={item.id} className={cn("flex items-start gap-3 p-4", !item.isRead && "bg-gold-50/40 dark:bg-gold-900/5")}>
            {!item.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
            <div className={cn("flex-1", item.isRead && "ps-5 opacity-70")}>
              <p className="text-sm font-semibold text-navy-800 dark:text-white">{item.title}</p>
              <p className="mt-0.5 text-sm text-navy-500 dark:text-navy-400">{item.body}</p>
              <p className="mt-1 text-xs text-navy-400">
                {format.relativeTime(new Date(item.createdAt), new Date())}
              </p>
            </div>
            {!item.isRead && (
              <button
                type="button"
                onClick={() => markOne(item.id)}
                disabled={isPending}
                className="shrink-0 text-xs font-semibold text-navy-400 hover:text-gold-500"
              >
                {t("markRead")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
