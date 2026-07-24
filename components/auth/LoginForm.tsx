"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl?: string;
  initialError?: string;
}) {
  const t = useTranslations("auth.login");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [showResend, setShowResend] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setShowResend(false);
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginAction({
        email: form.get("email"),
        password: form.get("password"),
        remember,
        callbackUrl,
        locale,
      });

      if (!result.ok) {
        setError(result.error);
        if (result.error === t("errors.emailNotVerified")) setShowResend(true);
        return;
      }

      router.push(result.redirectTo ?? "/panel");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{error}</p>
            {showResend && (
              <a href={`/${locale}/forgot-password`} className="mt-1 inline-block font-semibold underline">
                {t("resendVerification")}
              </a>
            )}
          </div>
        </div>
      )}

      <Field label={t("emailLabel")} htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          dir="ltr"
          required
        />
      </Field>

      <Field label={t("passwordLabel")} htmlFor="password" required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
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

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          {t("rememberMe")}
        </label>
        <a href={`/${locale}/forgot-password`} className="text-sm font-medium text-navy-700 hover:text-gold-500 dark:text-navy-300">
          {t("forgotPasswordLink")}
        </a>
      </div>

      <Button type="submit" variant="gold" size="lg" loading={isPending} className="mt-2">
        {isPending ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-sm text-navy-500 dark:text-navy-400">
        {t("noAccount")}{" "}
        <a href={`/${locale}/register`} className="font-semibold text-navy-800 hover:text-gold-500 dark:text-white">
          {t("registerLink")}
        </a>
      </p>
    </form>
  );
}
