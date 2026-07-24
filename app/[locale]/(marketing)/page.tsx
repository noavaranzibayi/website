import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/sections/Hero";
import AboutTeaser from "@/components/sections/AboutTeaser";
import Services from "@/components/sections/Services";
import WhyUs from "@/components/sections/WhyUs";
import CtaBanner from "@/components/sections/CtaBanner";
import ContactTeaser from "@/components/sections/ContactTeaser";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      <AboutTeaser />
      <Services limit={8} showViewAll showNote={false} />
      <WhyUs />
      <CtaBanner />
      <ContactTeaser />
    </>
  );
}
