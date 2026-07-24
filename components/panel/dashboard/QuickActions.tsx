import { UserPlus, ShieldPlus, CalendarClock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function QuickActions({
  canCreateUser,
  canCreateAdmin,
  canViewAppointments,
}: {
  canCreateUser: boolean;
  canCreateAdmin: boolean;
  canViewAppointments: boolean;
}) {
  const t = await getTranslations("dashboard.quickActions");

  const actions = [
    canCreateUser && { href: "/panel/admin/users?new=1", label: t("addUser"), icon: UserPlus },
    canCreateAdmin && { href: "/panel/admin/admins?new=1", label: t("addAdmin"), icon: ShieldPlus },
    canViewAppointments && { href: "/panel/admin/appointments", label: t("manageAppointments"), icon: CalendarClock },
  ].filter(Boolean) as { href: string; label: string; icon: typeof UserPlus }[];

  if (actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
      <h3 className="text-sm font-bold text-navy-800 dark:text-white">{t("title")}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-navy-100 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-sm dark:border-navy-800"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 text-gold-300">
              <action.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold text-navy-700 dark:text-navy-200">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
