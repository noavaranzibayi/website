import Image from "next/image";
import { Target, Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function About() {
  const t = await getTranslations("about");

  const cards = [
    { key: "goal", icon: Target, accent: "from-gold-400 to-gold-300" },
    { key: "method", icon: Compass, accent: "from-lime-400 to-lime-300" },
  ] as const;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div className="relative mx-auto w-full max-w-sm lg:mx-0">
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-gold-100 via-white to-lime-100 dark:from-navy-900 dark:via-navy-950 dark:to-navy-900" />
          <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
            <Image src="/logo.svg" alt="نوآوران زیبایی" width={140} height={113} />
          </div>
        </div>

        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-gold-500">
            {t("subtitle")}
          </span>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {cards.map(({ key, icon: Icon, accent }) => (
              <div
                key={key}
                className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-navy-800 dark:bg-navy-900"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-navy-900 shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-800 dark:text-white">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 leading-7 text-navy-600 dark:text-navy-300">
                  {t(`${key}.text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
