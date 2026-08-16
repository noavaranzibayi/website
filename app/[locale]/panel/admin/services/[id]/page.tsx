import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePagePermission } from "@/lib/page-guard";
import { getServiceById } from "@/lib/data/services";
import Breadcrumb from "@/components/panel/Breadcrumb";
import ServiceForm from "@/components/panel/services/ServiceForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesAdmin" });
  return { title: t("editTitle") };
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);
  await requirePagePermission(locale, "SERVICES", "EDIT");

  const service = await getServiceById(id);
  if (!service) notFound();

  const t = await getTranslations("servicesAdmin");
  const tNav = await getTranslations("panel.nav");

  const EMPTY = { tag: "", title: "", description: "" };
  const byLocale: Record<"fa" | "en" | "ar", { tag: string; title: string; description: string }> = {
    fa: service.translations.find((tr) => tr.locale === "fa") ?? EMPTY,
    en: service.translations.find((tr) => tr.locale === "en") ?? EMPTY,
    ar: service.translations.find((tr) => tr.locale === "ar") ?? EMPTY,
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: tNav("services"), href: "/panel/admin/services" },
          { label: byLocale.fa?.title ?? service.slug },
        ]}
      />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("editTitle")}</h1>
      </div>

      <ServiceForm
        initial={{
          id: service.id,
          slug: service.slug,
          image: service.image,
          order: service.order,
          isActive: service.isActive,
          fa: byLocale.fa ?? { tag: "", title: "", description: "" },
          en: byLocale.en ?? { tag: "", title: "", description: "" },
          ar: byLocale.ar ?? { tag: "", title: "", description: "" },
        }}
      />
    </div>
  );
}
