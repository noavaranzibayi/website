"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale() as Locale;

  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      await forgotPasswordAction({ email: form.get("email"), locale });
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="text-base font-bold text-navy-800 dark:text-white">{t("successTitle")}</p>
        <p className="text-sm text-navy-500 dark:text-navy-400">{t("successDescription")}</p>
        <a href={`/${locale}/login`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-gold-500 dark:text-white">
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          {t("backToLogin")}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label={t("emailLabel")} htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" dir="ltr" required />
      </Field>

      <Button type="submit" variant="gold" size="lg" loading={isPending} className="mt-2">
        {isPending ? t("submitting") : t("submit")}
      </Button>

      <a href={`/${locale}/login`} className="text-center text-sm font-medium text-navy-600 hover:text-gold-500 dark:text-navy-300">
        {t("backToLogin")}
      </a>
    </form>
  );
}
