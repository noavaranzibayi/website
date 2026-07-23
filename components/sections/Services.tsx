import { Info, Sparkles, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SERVICE_ICONS } from "@/lib/content-icons";

type ServiceItem = { id: string; title: string };

export default async function Services({
  limit,
  showViewAll = false,
  showNote = true,
  showHeading = true,
}: {
  limit?: number;
  showViewAll?: boolean;
  showNote?: boolean;
  showHeading?: boolean;
} = {}) {
  const t = await getTranslations("services");
  const tCommon = await getTranslations("common");
  const allItems = t.raw("items") as ServiceItem[];
  const items = limit ? allItems.slice(0, limit) : allItems;

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute -bottom-24 end-1/4 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {showHeading && (
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-300">
              <Sparkles className="h-4 w-4" />
              {t("title")}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              {t("subtitle")}
            </h2>
          </div>
        )}

        <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${showHeading ? "mt-10" : ""}`}>
          {items.map((item) => {
            const Icon = SERVICE_ICONS[item.id] ?? Sparkles;
            return (
              <div
                key={item.id}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur transition-all hover:-translate-y-1 hover:border-gold-400/40 hover:bg-white/[0.08]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30 transition-colors group-hover:bg-gold-400 group-hover:text-navy-900 group-hover:ring-gold-400">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-white">{item.title}</span>
              </div>
            );
          })}
        </div>

        {showViewAll && (
          <div className="mt-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
            >
              {tCommon("viewAllServices")}
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        )}

        {showNote && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold-400/20 bg-gold-400/[0.06] px-5 py-4 text-sm text-navy-100">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
            {t("note")}
          </div>
        )}
      </div>
    </section>
  );
}
