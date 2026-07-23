"use client";

import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, string> = {
  fa: "FA",
  ar: "AR",
  en: "EN",
};

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div className="flex items-center gap-1 rounded-full border border-navy-200 bg-white/70 p-1 text-sm font-medium dark:border-navy-700 dark:bg-navy-900/40">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() =>
            router.replace(
              // @ts-expect-error -- pathname/params typing is validated at runtime by next-intl
              { pathname, params },
              { locale: l }
            )
          }
          aria-current={l === locale}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            l === locale
              ? "bg-navy-600 text-white"
              : "text-navy-600 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
