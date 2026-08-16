import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import ServicesListView from "@/components/panel/services/ServicesListView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesAdmin" });
  return { title: t("title") };
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale as Locale);

  return <ServicesListView locale={locale} searchParams={resolvedSearchParams} />;
}
