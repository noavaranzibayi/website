import { ArrowLeft, Target, Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BrandLockup from "@/components/BrandLockup";
import Reveal from "@/components/motion/Reveal";

export default async function AboutTeaser() {
  const t = await getTranslations();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <Reveal className="relative mx-auto w-full max-w-sm lg:mx-0" y={32}>
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-gold-100 via-white to-lime-100 dark:from-navy-900 dark:via-navy-950 dark:to-navy-900" />
          <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <div className="rounded-[2rem] bg-gradient-to-br from-white via-navy-50 to-gold-50 px-8 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:from-navy-900 dark:via-navy-900 dark:to-navy-800">
              <BrandLockup size="lg" showSubtitle className="scale-[1.08]" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="text-sm font-bold uppercase tracking-wider text-gold-500">
            {t("home.aboutEyebrow")}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-navy-800 dark:text-white sm:text-3xl">
            {t("about.title")}
          </h2>
          <p className="mt-4 max-w-xl leading-8 text-navy-600 dark:text-navy-300">
            {t("about.goal.text")}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-navy-700 dark:text-navy-200">
            <span className="flex items-center gap-2 rounded-full bg-navy-50 px-4 py-2 dark:bg-navy-900">
              <Target className="h-4 w-4 text-gold-500" />
              {t("about.goal.title")}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-navy-50 px-4 py-2 dark:bg-navy-900">
              <Compass className="h-4 w-4 text-lime-600" />
              {t("about.method.title")}
            </span>
          </div>

          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-navy-800 transition-colors hover:text-gold-500 dark:text-white"
          >
            {t("common.learnMore")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
