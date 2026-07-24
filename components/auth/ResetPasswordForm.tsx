"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth.resetPassword");
  const locale = useLocale() as Locale;

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        password: form.get("password"),
        confirmPassword: form.get("confirmPassword"),
      });

      if (!result.ok) {
        setError(result.error);
        if (result.invalid) setInvalid(true);
        return;
      }

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
        <a href={`/${locale}/login`} className="mt-2 text-sm font-semibold text-navy-800 hover:text-gold-500 dark:text-white">
          {t("goToLogin")}
        </a>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
          <XCircle className="h-6 w-6" />
        </span>
        <p className="text-base font-bold text-navy-800 dark:text-white">{t("invalidTokenTitle")}</p>
        <p className="text-sm text-navy-500 dark:text-navy-400">{t("invalidTokenDescription")}</p>
        <a href={`/${locale}/forgot-password`} className="mt-2 text-sm font-semibold text-navy-800 hover:text-gold-500 dark:text-white">
          {t("requestNewLink")}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Field label={t("passwordLabel")} htmlFor="password" required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            className="pe-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-navy-400 hover:text-navy-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Field label={t("confirmPasswordLabel")} htmlFor="confirmPassword" required>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          dir="ltr"
          required
        />
      </Field>

      <Button type="submit" variant="gold" size="lg" loading={isPending} className="mt-2">
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
