"use client";

import { useState } from "react";
import { Menu, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import BrandLogo from "@/components/BrandLogo";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { NavItem } from "@/lib/panel-nav";
import { NAV_ICONS } from "@/components/panel/nav-icons";

export default function MobileNav({ navItems }: { navItems: NavItem[] }) {
  const t = useTranslations("panel");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-200 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent side="start">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <BrandLogo alt="" size="sm" />
            <DrawerTitle>نوآوران زیبایی</DrawerTitle>
          </div>
        </DrawerHeader>
        <nav className="flex-1 overflow-y-auto px-2.5 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = NAV_ICONS[item.key];
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-navy-800 text-white dark:bg-gold-400 dark:text-navy-900"
                        : "text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-900"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{t(`nav.${item.key}`)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-navy-100 p-2.5 dark:border-navy-800">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-500 hover:bg-navy-50 dark:text-navy-400 dark:hover:bg-navy-900"
          >
            <ExternalLink className="h-[18px] w-[18px] shrink-0" />
            {t("nav.backToSite")}
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
