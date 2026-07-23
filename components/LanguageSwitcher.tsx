"use client";

import { useParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, string> = {
  fa: "فارسی",
  ar: "العربية",
  en: "English",
};

const LOCALE_CODES: Record<Locale, string> = {
  fa: "FA",
  ar: "AR",
  en: "EN",
};

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-full border border-navy-200 bg-white/70 px-3 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-900/40 dark:text-navy-200 dark:hover:bg-navy-800"
        >
          <Globe className="h-4 w-4 text-navy-500 dark:text-navy-300" />
          {LOCALE_CODES[locale]}
          <ChevronDown className="h-3.5 w-3.5 text-navy-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="dropdown-content z-[60] min-w-[10rem] rounded-xl border border-navy-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-navy-700 dark:bg-navy-900"
        >
          {locales.map((l) => (
            <DropdownMenu.Item
              key={l}
              onSelect={() =>
                router.replace(
                  // @ts-expect-error -- pathname/params typing is validated at runtime by next-intl
                  { pathname, params },
                  { locale: l }
                )
              }
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 outline-none transition-colors data-[highlighted]:bg-navy-50 dark:text-navy-200 dark:data-[highlighted]:bg-navy-800"
            >
              <span className="w-7 shrink-0 text-xs font-bold text-navy-400">
                {LOCALE_CODES[l]}
              </span>
              <span className="flex-1">{LOCALE_LABELS[l]}</span>
              {l === locale && <Check className="h-4 w-4 text-gold-500" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
