"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle } from "lucide-react";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import FloatImage from "@/components/motion/FloatImage";

type FaqItem = { q: string; a: string };

export default function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        <div className="mx-auto w-full max-w-xs lg:mx-0">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-500">
              <HelpCircle className="h-4 w-4" />
              {t("title")}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-navy-800 dark:text-white sm:text-3xl">
              {t("subtitle")}
            </h2>
          </Reveal>

          <FloatImage
            className="relative mx-auto mt-8 hidden w-56 sm:block lg:mx-0"
            glowClassName="absolute inset-6 -z-10 rounded-full bg-gradient-to-br from-gold-100 via-white to-lime-100 blur-2xl dark:from-navy-900 dark:via-navy-950 dark:to-navy-900"
            src="/illustrations/faq-helper.png"
            alt={t("title")}
            width={300}
            height={400}
            amplitude={12}
            duration={4.5}
          />
        </div>

        <StaggerGroup className="divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white dark:divide-navy-800 dark:border-navy-800 dark:bg-navy-900">
          {items.map((item, i) => {
            const open = openIndex === i;
            return (
              <StaggerItem key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="text-sm font-bold text-navy-800 dark:text-white sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gold-500 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-7 text-navy-600 dark:text-navy-300">
                      {item.a}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
