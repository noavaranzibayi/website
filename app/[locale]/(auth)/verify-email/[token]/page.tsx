import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import AuthCard from "@/components/auth/AuthCard";
import ResendVerificationForm from "@/components/auth/ResendVerificationForm";
import { verifyEmailToken } from "@/lib/actions/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.verifyEmail" });
  return { title: t("title") };
}

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("auth.verifyEmail");

  const result = await verifyEmailToken(token);

  return (
    <AuthCard title={t("title")}>
      {result.ok ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="text-base font-bold text-navy-800 dark:text-white">{t("successTitle")}</p>
          <p className="text-sm text-navy-500 dark:text-navy-400">{t("successDescription")}</p>
          <Link
            href="/login"
            className="mt-2 text-sm font-semibold text-navy-800 hover:text-gold-500 dark:text-white"
          >
            {t("goToLogin")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <XCircle className="h-6 w-6" />
          </span>
          <p className="text-base font-bold text-navy-800 dark:text-white">{t("invalidTokenTitle")}</p>
          <p className="text-sm text-navy-500 dark:text-navy-400">{t("invalidTokenDescription")}</p>
          <ResendVerificationForm />
        </div>
      )}
    </AuthCard>
  );
}
