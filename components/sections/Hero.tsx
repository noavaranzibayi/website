"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Droplets, Scissors, Zap, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Slide = { id: string; tag: string; title: string; subtitle: string };

const SLIDE_THEME: Record<
  string,
  { icon: LucideIcon; gradient: string; glow: string }
> = {
  brand: {
    icon: Sparkles,
    gradient: "from-navy-800 via-navy-700 to-navy-900",
    glow: "from-gold-400/30 to-transparent",
  },
  skin: {
    icon: Droplets,
    gradient: "from-navy-900 via-[#3a2a52] to-navy-800",
    glow: "from-lime-400/25 to-transparent",
  },
  hair: {
    icon: Scissors,
    gradient: "from-navy-900 via-[#54371f] to-navy-800",
    glow: "from-gold-400/30 to-transparent",
  },
  laser: {
    icon: Zap,
    gradient: "from-navy-950 via-navy-800 to-[#123a4a]",
    glow: "from-lime-400/25 to-transparent",
  },
};

const AUTOPLAY_MS = 6000;

export default function Hero() {
  const t = useTranslations("hero");
  const slides = t.raw("slides") as Slide[];
  const bullets = t.raw("bullets") as string[];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden"
    >
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px]">
        {slides.map((slide, i) => {
          const theme = SLIDE_THEME[slide.id] ?? SLIDE_THEME.brand;
          const Icon = theme.icon;
          const active = i === index;
          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} transition-opacity duration-1000 ease-in-out ${
                active ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className={`absolute -top-24 end-[-6rem] h-96 w-96 rounded-full bg-gradient-to-b ${theme.glow} blur-3xl`}
              />
              <div className="absolute -bottom-32 start-[-4rem] h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />

              <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
                <div
                  className={`max-w-2xl transition-all duration-700 ease-out ${
                    active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gold-200 ring-1 ring-white/15 backdrop-blur">
                    <Icon className="h-4 w-4" />
                    {slide.tag}
                  </span>

                  <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-8 text-navy-100 sm:text-lg">
                    {slide.subtitle}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href="/services"
                      className="rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-lg shadow-gold-900/20 transition-transform hover:scale-[1.03] hover:bg-gold-300"
                    >
                      {t("ctaServices")}
                    </Link>
                    <Link
                      href="/booking"
                      className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
                    >
                      {t("ctaBooking")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Arrows */}
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous slide"
          className="absolute inset-y-0 start-2 z-20 hidden items-center sm:flex"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20">
            <ChevronLeft className="h-5 w-5" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next slide"
          className="absolute inset-y-0 end-2 z-20 hidden items-center sm:flex"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20">
            <ChevronRight className="h-5 w-5" />
          </span>
        </button>

        {/* Dots */}
        <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={slide.tag}
              aria-current={i === index}
              className="group relative h-1.5 w-8 overflow-hidden rounded-full bg-white/25"
            >
              {i === index && (
                <span
                  key={`${slide.id}-${paused}`}
                  className="absolute inset-y-0 start-0 rounded-full bg-gold-400"
                  style={{
                    animation: paused
                      ? undefined
                      : `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
                    width: paused ? "100%" : undefined,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative z-10 border-b border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 sm:px-6 sm:justify-between">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-center gap-2.5 text-sm font-medium text-navy-700 dark:text-navy-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300">
                <Check className="h-3.5 w-3.5" />
              </span>
              {bullet}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
