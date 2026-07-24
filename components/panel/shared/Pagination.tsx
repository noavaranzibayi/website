import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  basePath,
  searchParams,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const t = await getTranslations("panel.table");

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-navy-100 px-4 py-3 dark:border-navy-800 sm:flex-row">
      <p className="text-xs text-navy-400">
        {t("showingResults", { from, to, total })}
      </p>
      <div className="flex items-center gap-1.5">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 dark:border-navy-700 ${
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-navy-50 dark:hover:bg-navy-800"
          }`}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <span className="px-2 text-xs font-medium text-navy-500">
          {t("page")} {page} {t("of")} {pageCount}
        </span>
        <Link
          href={hrefFor(Math.min(pageCount, page + 1))}
          aria-disabled={page >= pageCount}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 dark:border-navy-700 ${
            page >= pageCount ? "pointer-events-none opacity-40" : "hover:bg-navy-50 dark:hover:bg-navy-800"
          }`}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
