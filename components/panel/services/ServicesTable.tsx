"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/state";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { updateServiceAction, deleteServiceAction } from "@/lib/actions/services";
import type { Locale } from "@/app/generated/prisma/client";

type Translation = { locale: Locale; tag: string; title: string; description: string };

export type ServiceRow = {
  id: string;
  slug: string;
  image: string;
  order: number;
  isActive: boolean;
  translations: Translation[];
};

export default function ServicesTable({
  rows,
  canEdit,
  canDelete,
}: {
  rows: ServiceRow[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const t = useTranslations("servicesAdmin");
  const tCommon = useTranslations("panel.common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<ServiceRow | null>(null);

  function titleFor(row: ServiceRow) {
    const match = row.translations.find((tr) => tr.locale === locale) ?? row.translations.find((tr) => tr.locale === "fa");
    return match?.title ?? row.slug;
  }

  function toggleActive(row: ServiceRow) {
    const byLocale = Object.fromEntries(row.translations.map((tr) => [tr.locale, tr])) as Record<
      Locale,
      Translation
    >;
    startTransition(async () => {
      const result = await updateServiceAction({
        id: row.id,
        slug: row.slug,
        image: row.image,
        order: row.order,
        isActive: !row.isActive,
        fa: byLocale.fa,
        en: byLocale.en,
        ar: byLocale.ar,
      });
      if (result.ok) {
        toast.success(t("toast.updated"));
        router.refresh();
      } else {
        toast.error(tCommon("error"));
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const row = deleteTarget;
    startTransition(async () => {
      const result = await deleteServiceAction(row.id);
      if (result.ok) {
        toast.success(t("toast.deleted"));
        router.refresh();
      } else {
        toast.error(tCommon("error"));
      }
      setDeleteTarget(null);
    });
  }

  if (rows.length === 0) {
    return <EmptyState icon={Sparkles} title={t("empty")} className="py-16" />;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-xs text-navy-400 dark:border-navy-800">
              <th className="px-4 py-3 text-start font-semibold">{t("columns.service")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.slug")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.order")}</th>
              <th className="px-2 py-3 text-start font-semibold">{t("columns.status")}</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40 dark:border-navy-800/60 dark:hover:bg-navy-900/40"
              >
                <td className="px-4 py-3">
                  <Link href={`/panel/admin/services/${row.id}`} className="flex items-center gap-3">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy-50 dark:bg-navy-800">
                      <Image src={row.image} alt="" width={64} height={64} className="h-full w-full object-contain" />
                    </span>
                    <span className="truncate font-semibold text-navy-800 dark:text-white">{titleFor(row)}</span>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-navy-500" dir="ltr">
                  {row.slug}
                </td>
                <td className="px-2 py-3 text-navy-500">{row.order}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.isActive}
                      onCheckedChange={() => toggleActive(row)}
                      disabled={!canEdit || isPending}
                    />
                    <span className="text-xs text-navy-500">{row.isActive ? t("active") : t("inactive")}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={`/${locale}/services/${row.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                      title={t("actions.viewOnSite")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {canEdit && (
                      <Link
                        href={`/panel/admin/services/${row.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
                        title={t("actions.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title={t("actions.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
