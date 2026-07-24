import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/panel/MobileNav";
import NotificationsBell, { type NotificationItem } from "@/components/panel/NotificationsBell";
import UserMenu from "@/components/panel/UserMenu";
import type { NavItem } from "@/lib/panel-nav";

export default async function Header({
  locale,
  navItems,
  user,
  notifications,
  unreadCount,
}: {
  locale: Locale;
  navItems: NavItem[];
  user: { name: string; email: string; image?: string | null; role: string };
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const t = await getTranslations("panel");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-navy-100 bg-white/90 px-4 backdrop-blur dark:border-navy-800 dark:bg-navy-950/90 sm:px-6">
      <MobileNav navItems={navItems} />

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-navy-400" />
        <input
          type="search"
          placeholder={t("header.searchPlaceholder")}
          className="h-10 w-full rounded-xl border border-navy-200 bg-navy-50/40 ps-9 pe-3 text-sm text-navy-900 outline-none transition-colors focus:border-gold-400 focus:bg-white focus:ring-4 focus:ring-gold-100 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
        />
      </div>

      <div className="ms-auto flex items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher locale={locale} />
        <NotificationsBell items={notifications} unreadCount={unreadCount} />
        <UserMenu
          name={user.name}
          email={user.email}
          image={user.image}
          roleLabel={t(`roleLabels.${user.role}`)}
        />
      </div>
    </header>
  );
}
