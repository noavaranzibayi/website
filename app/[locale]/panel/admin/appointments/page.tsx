import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { AppointmentStatus } from "@/app/generated/prisma/client";
import { requirePagePermission } from "@/lib/page-guard";
import { queryAppointments, getMonthAppointmentCounts } from "@/lib/data/appointments";
import Breadcrumb from "@/components/panel/Breadcrumb";
import AppointmentsFilters from "@/components/panel/appointments/AppointmentsFilters";
import AppointmentsTable from "@/components/panel/appointments/AppointmentsTable";
import CalendarMonth from "@/components/panel/appointments/CalendarMonth";
import Pagination from "@/components/panel/shared/Pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appointments" });
  return { title: t("title") };
}

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string; view?: string; month?: string; date?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale as Locale);
  await requirePagePermission(locale, "APPOINTMENTS", "VIEW");
  const t = await getTranslations("appointments");
  const tNav = await getTranslations("panel.nav");

  const view = sp.view === "calendar" ? "calendar" : "list";
  const basePath = "/panel/admin/appointments";

  const now = new Date();
  const [year, monthStr] = (sp.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`).split("-");
  const monthIndex0 = Number(monthStr) - 1;

  const page = Number(sp.page) || 1;
  const dateFilter = view === "calendar" && sp.date ? sp.date : undefined;

  const result = await queryAppointments({
    q: sp.q,
    status: sp.status as AppointmentStatus | undefined,
    page,
  });

  // For calendar day selection, filter client-visible rows by the selected day.
  const filteredItems = dateFilter
    ? result.items.filter((item) => {
        const d = item.confirmedDate ?? item.requestedDate;
        return d.toISOString().slice(0, 10) === dateFilter;
      })
    : result.items;

  const counts =
    view === "calendar"
      ? await getMonthAppointmentCounts(Number(year), monthIndex0)
      : new Map<string, number>();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("appointments") }]} />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <AppointmentsFilters basePath={basePath} initialQuery={sp.q} initialStatus={sp.status} view={view} />

        {view === "calendar" ? (
          <div className="grid gap-4 border-t border-navy-100 dark:border-navy-800 lg:grid-cols-[340px_1fr]">
            <div className="border-b border-navy-100 dark:border-navy-800 lg:border-b-0 lg:border-e">
              <CalendarMonth
                year={Number(year)}
                monthIndex0={monthIndex0}
                counts={Object.fromEntries(counts)}
                selectedDate={sp.date}
                basePath={basePath}
              />
            </div>
            <div>
              <AppointmentsTable rows={filteredItems} />
            </div>
          </div>
        ) : (
          <>
            <AppointmentsTable rows={result.items} />
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
              basePath={basePath}
              searchParams={sp}
            />
          </>
        )}
      </div>
    </div>
  );
}
