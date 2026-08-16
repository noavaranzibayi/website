"use client";

import { Toaster as Sonner } from "sonner";
import { useLocale } from "next-intl";
import { useTheme } from "@/components/ThemeProvider";
import { localeDirections, type Locale } from "@/i18n/routing";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  const locale = useLocale() as Locale;

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      dir={localeDirections[locale]}
      position={localeDirections[locale] === "rtl" ? "top-left" : "top-right"}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-2xl! border! border-navy-100! dark:border-navy-800! font-[inherit]!",
        },
      }}
    />
  );
}
