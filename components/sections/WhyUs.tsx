import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { WHY_US_ICONS } from "@/lib/content-icons";

type WhyItem = { id: string; title: string; text: string };

export default async function WhyUs() {
  const t = await getTranslations("whyUs");
  const items = t.raw("items") as WhyItem[];

  return (
    <section id="why-us" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-500">
          <ShieldCheck className="h-4 w-4" />
          {t("title")}
        </span>
        <h2 className="mt-2 text-2xl font-extrabold text-navy-800 dark:text-white sm:text-3xl">
          {t("subtitle")}
        </h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {items.map((item, i) => {
          const Icon = WHY_US_ICONS[item.id] ?? ShieldCheck;
          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-navy-800 dark:bg-navy-900"
            >
              <span className="absolute -top-4 -end-2 text-7xl font-black text-navy-50 dark:text-navy-800">
                0{i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 text-gold-300">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-5 text-lg font-bold text-navy-800 dark:text-white">
                {item.title}
              </h3>
              <p className="relative mt-2 leading-7 text-navy-600 dark:text-navy-300">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
