import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/panel/Breadcrumb";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileOverviewForm from "@/components/panel/profile/ProfileOverviewForm";
import ChangePasswordForm from "@/components/panel/profile/ChangePasswordForm";
import ProfileSessionsPanel from "@/components/panel/profile/ProfileSessionsPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("title") };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") redirect(`/${locale}/login`);

  const [user, sessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.session.findMany({
      where: { userId: session.user.id, expires: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, sessionToken: true, ip: true, userAgent: true, createdAt: true },
    }),
  ]);

  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("profile");
  const tNav = await getTranslations("panel.nav");

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("profile") }]} />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
            <TabsTrigger value="sessions">{t("tabs.sessions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProfileOverviewForm name={user.name} email={user.email} phone={user.phone} />
          </TabsContent>

          <TabsContent value="security">
            <ChangePasswordForm />
          </TabsContent>

          <TabsContent value="sessions">
            <ProfileSessionsPanel
              sessions={sessions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
              currentSessionToken={session.sessionId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
