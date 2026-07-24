import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/session";
import { getNavItems } from "@/lib/panel-nav";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/routing";
import Sidebar from "@/components/panel/Sidebar";
import Header from "@/components/panel/Header";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") {
    redirect(`/${locale}/login`);
  }

  const [navItems, notifications, unreadCount] = await Promise.all([
    getNavItems(session.user),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, body: true, isRead: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
  ]);

  return (
    <div className="flex min-h-screen bg-navy-50/30 dark:bg-navy-950">
      <Sidebar navItems={navItems} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          locale={locale as Locale}
          navItems={navItems}
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: session.user.role,
          }}
          notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
