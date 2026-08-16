import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePagePermission } from "@/lib/page-guard";
import { getNextServiceOrder } from "@/lib/data/services";
import Breadcrumb from "@/components/panel/Breadcrumb";
import ServiceForm from "@/components/panel/services/ServiceForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesAdmin" });
  return { title: t("createTitle") };
}

export default async function NewServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  await requirePagePermission(locale, "SERVICES", "CREATE");

  const t = await getTranslations("servicesAdmin");
  const tNav = await getTranslations("panel.nav");
  const nextOrder = await getNextServiceOrder();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: tNav("services"), href: "/panel/admin/services" },
          { label: t("createTitle") },
        ]}
      />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("createTitle")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("createSubtitle")}</p>
      </div>

      <ServiceForm
        initial={{
          slug: "",
          image: "",
          order: nextOrder,
          isActive: true,
          fa: { tag: "", title: "", description: "" },
          en: { tag: "", title: "", description: "" },
          ar: { tag: "", title: "", description: "" },
        }}
      />
    </div>
  );
}
