import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePagePermission } from "@/lib/page-guard";
import { queryAuditLog } from "@/lib/data/audit";
import Breadcrumb from "@/components/panel/Breadcrumb";
import AuditLogFilters from "@/components/panel/audit/AuditLogFilters";
import AuditLogTable from "@/components/panel/audit/AuditLogTable";
import Pagination from "@/components/panel/shared/Pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditLog" });
  return { title: t("title") };
}

export default async function AuditLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale as Locale);
  await requirePagePermission(locale, "AUDIT_LOG", "VIEW");
  const t = await getTranslations("auditLog");
  const tNav = await getTranslations("panel.nav");

  const page = Number(sp.page) || 1;
  const result = await queryAuditLog({ q: sp.q, page });
  const basePath = "/panel/admin/audit-log";

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("auditLog") }]} />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <AuditLogFilters basePath={basePath} initialQuery={sp.q} />
        <AuditLogTable rows={result.items} />
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageSize={result.pageSize}
          basePath={basePath}
          searchParams={sp}
        />
      </div>
    </div>
  );
}
