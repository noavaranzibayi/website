"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { RoleName } from "@/app/generated/prisma/client";
import type { Locale } from "@/i18n/routing";
import BrandLogo from "./BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header({
  locale,
  sessionUser,
}: {
  locale: Locale;
  sessionUser: { name: string; role: RoleName } | null;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links: { href: string; label: string }[] = [
    { href: "/about", label: t("about") },
    { href: "/services", label: t("services") },
    { href: "/contact", label: t("contact") },
  ];
  const panelHref = sessionUser?.role === "USER" ? "/panel/profile" : "/panel/admin/dashboard";

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur dark:border-navy-800 dark:bg-navy-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandLogo alt="نوآوران زیبایی" size="xl" className="dark:hidden" priority />
          <BrandLogo alt="نوآوران زیبایی" size="xl" surface="dark" className="hidden dark:block" priority />
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 transition-colors ${
                isActive(link.href)
                  ? "bg-navy-50 text-navy-900 dark:bg-navy-900 dark:text-white"
                  : "text-navy-600 hover:bg-navy-50 hover:text-navy-900 dark:text-navy-300 dark:hover:bg-navy-900 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeSwitcher />
          <LanguageSwitcher locale={locale} />
          {sessionUser ? (
            <Link
              href={panelHref}
              className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-100 dark:hover:bg-navy-900"
            >
              {t("panel")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-navy-900"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-100 dark:hover:bg-navy-900"
              >
                {t("register")}
              </Link>
            </>
          )}
          <Link
            href="/booking"
            className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-gold-300"
          >
            {t("booking")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center rounded-lg border border-navy-200 p-2 text-navy-600 dark:border-navy-700 dark:text-navy-200 lg:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white px-4 py-4 dark:border-navy-800 dark:bg-navy-950 lg:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 transition-colors ${
                  isActive(link.href)
                    ? "bg-navy-50 text-navy-900 dark:bg-navy-900 dark:text-white"
                    : "text-navy-600 dark:text-navy-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {sessionUser ? (
              <Link
                href={panelHref}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-semibold text-navy-700 dark:text-navy-100"
              >
                {t("panel")}
              </Link>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-2 font-semibold text-navy-700 dark:text-navy-100"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-navy-200 px-4 py-2 font-semibold text-navy-700 dark:border-navy-700 dark:text-navy-100"
                >
                  {t("register")}
                </Link>
              </div>
            )}
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-2 w-fit rounded-full bg-gold-400 px-4 py-2 font-semibold text-navy-900"
            >
              {t("booking")}
            </Link>
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      )}
    </header>
  );
}
