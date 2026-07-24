"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { resendVerificationAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function ResendVerificationForm() {
  const t = useTranslations("auth.verifyEmail");
  const locale = useLocale() as Locale;

  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      await resendVerificationAction({ email: form.get("email"), locale });
      setSent(true);
    });
  }

  if (sent) {
    return <p className="text-sm text-navy-500 dark:text-navy-400">{t("resendSuccess")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-navy-100 pt-4 dark:border-navy-800">
      <p className="text-sm font-bold text-navy-700 dark:text-navy-200">{t("resendTitle")}</p>
      <Field label={t("resendEmailLabel")} htmlFor="resend-email">
        <Input id="resend-email" name="email" type="email" dir="ltr" required />
      </Field>
      <Button type="submit" variant="outline" loading={isPending}>
        {isPending ? t("resendSubmitting") : t("resendSubmit")}
      </Button>
    </form>
  );
}
