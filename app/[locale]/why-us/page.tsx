import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import PageHeader from "@/components/PageHeader";
import WhyUs from "@/components/sections/WhyUs";
import Services from "@/components/sections/Services";
import CtaBanner from "@/components/sections/CtaBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "whyUs" });
  return { title: t("title") };
}

export default async function WhyUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "whyUs" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <PageHeader kicker={tNav("whyUs")} title={t("title")} subtitle={t("subtitle")} />
      <WhyUs showHeading={false} />
      <Services limit={8} showViewAll showNote={false} />
      <CtaBanner />
    </>
  );
}
