import { getTranslations } from "next-intl/server";
import { requirePagePermission } from "@/lib/page-guard";
import { hasPermission } from "@/lib/permissions";
import { queryServices } from "@/lib/data/services";
import Breadcrumb from "@/components/panel/Breadcrumb";
import ServicesFilters from "@/components/panel/services/ServicesFilters";
import ServicesTable from "@/components/panel/services/ServicesTable";
import Pagination from "@/components/panel/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";

export default async function ServicesListView({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: { q?: string; page?: string };
}) {
  const session = await requirePagePermission(locale, "SERVICES", "VIEW");
  const t = await getTranslations("servicesAdmin");
  const tNav = await getTranslations("panel.nav");

  const [canCreate, canEdit, canDelete] = await Promise.all([
    hasPermission(session.user, "SERVICES", "CREATE"),
    hasPermission(session.user, "SERVICES", "EDIT"),
    hasPermission(session.user, "SERVICES", "DELETE"),
  ]);

  const page = Number(searchParams.page) || 1;
  const result = await queryServices({ q: searchParams.q, page });

  const basePath = "/panel/admin/services";

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("services") }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
        </div>
        {canCreate && (
          <Button variant="gold" size="sm" asChild>
            <Link href="/panel/admin/services/new">
              <Plus className="h-4 w-4" />
              {t("addService")}
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <ServicesFilters basePath={basePath} initialQuery={searchParams.q} />
        <ServicesTable rows={result.items} canEdit={canEdit} canDelete={canDelete} />
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageSize={result.pageSize}
          basePath={basePath}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
