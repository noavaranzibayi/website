"use client";

import { useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, CheckCheck } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsBell({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const t = useTranslations("panel.header");
  const format = useFormatter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-200 dark:hover:bg-navy-800"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="dropdown-content z-[60] w-[22rem] max-w-[90vw] rounded-xl border border-navy-100 bg-white shadow-lg ring-1 ring-black/5 dark:border-navy-700 dark:bg-navy-900"
        >
          <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3 dark:border-navy-800">
            <span className="text-sm font-bold text-navy-800 dark:text-white">{t("notifications")}</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isPending}
                className="flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-gold-500 dark:text-navy-400"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-navy-400">{t("noNotifications")}</p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-navy-50 px-4 py-3 last:border-0 dark:border-navy-800/60"
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />}
                      <div className={n.isRead ? "opacity-70" : ""}>
                        <p className="text-sm font-semibold text-navy-800 dark:text-white">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-navy-500 dark:text-navy-400">{n.body}</p>
                        <p className="mt-1 text-[11px] text-navy-400">
                          {format.relativeTime(new Date(n.createdAt), { now: new Date() })}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-navy-100 p-2 dark:border-navy-800">
            <Link
              href="/panel/notifications"
              className="block rounded-lg px-3 py-2 text-center text-sm font-semibold text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
            >
              {t("viewAll")}
            </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
