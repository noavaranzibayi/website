"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronsLeft, ChevronsRight, ExternalLink } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/panel-nav";
import { NAV_ICONS } from "@/components/panel/nav-icons";

export default function Sidebar({ navItems }: { navItems: NavItem[] }) {
  const t = useTranslations("panel");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-e border-navy-100 bg-white transition-[width] duration-200 dark:border-navy-800 dark:bg-navy-950 lg:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-navy-100 px-4 dark:border-navy-800">
        <Image src="/logo.svg" alt="" width={28} height={22} className="shrink-0" />
        {!collapsed && (
          <span className="truncate text-sm font-bold text-navy-800 dark:text-white">نوآوران زیبایی</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = NAV_ICONS[item.key];
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  title={collapsed ? t(`nav.${item.key}`) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-navy-800 text-white dark:bg-gold-400 dark:text-navy-900"
                      : "text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-900"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-navy-100 p-2.5 dark:border-navy-800">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 dark:text-navy-400 dark:hover:bg-navy-900"
          title={collapsed ? t("nav.backToSite") : undefined}
        >
          <ExternalLink className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">{t("nav.backToSite")}</span>}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 dark:text-navy-400 dark:hover:bg-navy-900"
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          {collapsed ? (
            <ChevronsLeft className="h-[18px] w-[18px] shrink-0 rtl:rotate-180" />
          ) : (
            <ChevronsRight className="h-[18px] w-[18px] shrink-0 rtl:rotate-180" />
          )}
          {!collapsed && <span className="truncate">{t("sidebar.collapse")}</span>}
        </button>
      </div>
    </aside>
  );
}
