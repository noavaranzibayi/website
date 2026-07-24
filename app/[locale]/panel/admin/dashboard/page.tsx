import type { Metadata } from "next";
import { Users, UserCheck, UserPlus, ShieldCheck, Clock, CheckCircle2, CalendarDays, XCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePagePermission } from "@/lib/page-guard";
import { hasPermission } from "@/lib/permissions";
import { getDashboardData } from "@/lib/data/dashboard";
import StatCard from "@/components/panel/dashboard/StatCard";
import UserGrowthChart from "@/components/panel/dashboard/UserGrowthChart";
import AppointmentStatusChart from "@/components/panel/dashboard/AppointmentStatusChart";
import RecentActivity from "@/components/panel/dashboard/RecentActivity";
import UpcomingAppointments from "@/components/panel/dashboard/UpcomingAppointments";
import QuickActions from "@/components/panel/dashboard/QuickActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title") };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const session = await requirePagePermission(locale, "DASHBOARD", "VIEW");
  const t = await getTranslations("dashboard");

  const [data, canCreateUser, canCreateAdmin, canViewAppointments] = await Promise.all([
    getDashboardData(),
    hasPermission(session.user, "USERS", "CREATE"),
    hasPermission(session.user, "ADMINS", "CREATE"),
    hasPermission(session.user, "APPOINTMENTS", "VIEW"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("stats.totalUsers")} value={data.stats.totalUsers} icon={Users} accent="navy" />
        <StatCard label={t("stats.activeUsers")} value={data.stats.activeUsers} icon={UserCheck} accent="lime" />
        <StatCard label={t("stats.newUsers")} value={data.stats.newUsers} icon={UserPlus} accent="gold" />
        <StatCard label={t("stats.totalAdmins")} value={data.stats.totalAdmins} icon={ShieldCheck} accent="navy" />
        <StatCard label={t("stats.pendingAppointments")} value={data.stats.pendingAppointments} icon={Clock} accent="gold" />
        <StatCard label={t("stats.confirmedAppointments")} value={data.stats.confirmedAppointments} icon={CheckCircle2} accent="lime" />
        <StatCard label={t("stats.todayAppointments")} value={data.stats.todayAppointments} icon={CalendarDays} accent="navy" />
        <StatCard label={t("stats.cancelledAppointments")} value={data.stats.cancelledAppointments} icon={XCircle} accent="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <h3 className="text-sm font-bold text-navy-800 dark:text-white">{t("charts.userGrowth")}</h3>
          <p className="text-xs text-navy-400">{t("charts.userGrowthSubtitle")}</p>
          <div className="mt-2">
            <UserGrowthChart data={data.userGrowth} />
          </div>
        </div>
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <h3 className="text-sm font-bold text-navy-800 dark:text-white">{t("charts.appointmentStatus")}</h3>
          <p className="text-xs text-navy-400">{t("charts.appointmentStatusSubtitle")}</p>
          <div className="mt-2">
            <AppointmentStatusChart data={data.appointmentStatus} />
          </div>
        </div>
      </div>

      <QuickActions
        canCreateUser={canCreateUser}
        canCreateAdmin={canCreateAdmin}
        canViewAppointments={canViewAppointments}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity items={data.recentActivity} />
        <UpcomingAppointments items={data.upcoming} />
      </div>
    </div>
  );
}
