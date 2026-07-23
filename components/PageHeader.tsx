import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function PageHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  const t = await getTranslations("nav");

  return (
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
            {t("home")}
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
          <span className="text-gold-300">{kicker}</span>
        </nav>

        <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-7 text-navy-200">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
