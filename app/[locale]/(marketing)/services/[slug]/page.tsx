import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { ChevronLeft, CalendarCheck, MessageCircle, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getActiveServiceBySlug, getActiveServices } from "@/lib/data/services";
import { SERVICE_ICONS } from "@/lib/content-icons";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import CtaBanner from "@/components/sections/CtaBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getActiveServiceBySlug(slug, locale as Locale);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const service = await getActiveServiceBySlug(slug, locale as Locale);
  if (!service) notFound();

  const t = await getTranslations("services");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const allServices = await getActiveServices(locale as Locale);
  const related = allServices.filter((s) => s.slug !== slug).slice(0, 4);

  const Icon = SERVICE_ICONS[service.slug] ?? Sparkles;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute -top-16 end-1/4 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -bottom-16 start-1/4 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-sm text-navy-300">
            <Link href="/" className="transition-colors hover:text-gold-300">
              {tNav("home")}
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
            <Link href="/services" className="transition-colors hover:text-gold-300">
              {tNav("services")}
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span className="text-gold-300">{service.tag}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gold-200 ring-1 ring-white/15 backdrop-blur">
                <Icon className="h-4 w-4" />
                {service.tag}
              </span>
              <h1 className="mt-5 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                {service.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-navy-100 sm:text-lg">
                {service.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg shadow-gold-900/20 transition-transform hover:scale-[1.03] hover:bg-gold-300"
                >
                  <CalendarCheck className="h-4 w-4" />
                  {tCommon("bookNow")}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  {tNav("contact")}
                </Link>
              </div>
            </Reveal>

            <Reveal className="relative hidden items-center justify-center lg:flex" delay={0.1}>
              <div className="absolute inset-x-10 inset-y-10 -z-10 rounded-full bg-gradient-to-br from-gold-400/25 to-transparent blur-3xl" />
              <Image
                src={service.image}
                alt={service.tag}
                width={460}
                height={560}
                priority
                className="h-[26rem] w-auto object-contain drop-shadow-2xl"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <span className="text-sm font-bold uppercase tracking-wider text-gold-500">
              {t("title")}
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">
              {t("subtitle")}
            </h2>
          </Reveal>

          <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((item) => (
              <StaggerItem key={item.id}>
                <Link
                  href={`/services/${item.slug}`}
                  className="group flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-navy-100 bg-white pb-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-navy-800 dark:bg-navy-900"
                >
                  <div className="relative h-28 w-full sm:h-32">
                    <div className="absolute inset-x-6 bottom-0 top-3 -z-10 rounded-full bg-gold-100 blur-xl transition-colors dark:bg-navy-800" />
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={180}
                      height={220}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="px-2 text-sm font-semibold text-navy-800 dark:text-white">{item.title}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
