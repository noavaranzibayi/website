import { CalendarCheck, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CtaBanner() {
  const t = await getTranslations();

  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute -top-16 start-1/3 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute -bottom-16 end-1/3 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
          <CalendarCheck className="h-6 w-6" />
        </span>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          {t("home.ctaTitle")}
        </h2>
        <p className="max-w-xl text-navy-200">{t("home.ctaSubtitle")}</p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3 text-sm font-semibold text-navy-900 shadow-lg shadow-gold-900/20 transition-transform hover:scale-[1.03] hover:bg-gold-300"
        >
          {t("common.bookNow")}
          <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
