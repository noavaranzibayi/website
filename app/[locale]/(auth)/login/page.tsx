import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("title") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { callbackUrl, error } = await searchParams;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("auth.login");

  const initialError = error === "account_disabled" ? t("accountDisabledNotice") : undefined;

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <LoginForm callbackUrl={callbackUrl} initialError={initialError} />
    </AuthCard>
  );
}
