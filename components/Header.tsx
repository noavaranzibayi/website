"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links: { href: string; label: string }[] = [
    { href: "#about", label: t("about") },
    { href: "#services", label: t("services") },
    { href: "#why-us", label: t("whyUs") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur dark:border-navy-800 dark:bg-navy-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="نوآوران زیبایی" width={36} height={29} priority />
          <span className="text-base font-bold text-navy-700 dark:text-navy-100 sm:text-lg">
            نوآوران زیبایی
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-navy-600 dark:text-navy-200 lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-gold-500">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          <a
            href="#booking"
            className="rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-gold-300"
          >
            {t("booking")}
          </a>
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
          <nav className="flex flex-col gap-3 text-sm font-medium text-navy-600 dark:text-navy-200">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={() => setOpen(false)}
              className="w-fit rounded-full bg-gold-400 px-4 py-2 font-semibold text-navy-900"
            >
              {t("booking")}
            </a>
          </nav>
          <div className="mt-4">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      )}
    </header>
  );
}
