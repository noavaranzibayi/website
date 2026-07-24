import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePageSession } from "@/lib/page-guard";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/panel/Breadcrumb";
import NotificationsList from "@/components/panel/NotificationsList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notifications" });
  return { title: t("title") };
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const session = await requirePageSession(locale);
  const t = await getTranslations("notifications");
  const tNav = await getTranslations("panel.nav");

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("notifications") }]} />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <NotificationsList
          items={items.map((i) => ({
            id: i.id,
            title: i.title,
            body: i.body,
            isRead: i.isRead,
            createdAt: i.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
