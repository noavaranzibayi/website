import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import WhyUs from "@/components/sections/WhyUs";
import Booking from "@/components/sections/Booking";
import Contact from "@/components/sections/Contact";

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
      <About />
      <Services />
      <WhyUs />
      <Booking />
      <Contact />
    </>
  );
}
