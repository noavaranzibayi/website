import { defineRouting } from "next-intl/routing";

export const locales = ["fa", "ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export const localeDirections: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  ar: "rtl",
  en: "ltr",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
