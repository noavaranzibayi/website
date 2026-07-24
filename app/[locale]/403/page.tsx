import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "errors.403" });
  return { title: t("title") };
}

export default async function ForbiddenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("errors.403");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50/40 px-4 text-center dark:bg-navy-950">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 dark:bg-red-900/20">
        <ShieldAlert className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold text-navy-800 dark:text-white sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-navy-500 dark:text-navy-400">{t("description")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="gold">
          <Link href="/panel">{t("backToPanel")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t("backToSite")}</Link>
        </Button>
      </div>
    </div>
  );
}
