import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { requirePagePermission } from "@/lib/page-guard";
import { prisma } from "@/lib/prisma";
import { MODULES, ACTIONS, permissionKey, type PermissionKey } from "@/lib/rbac-constants";
import Breadcrumb from "@/components/panel/Breadcrumb";
import RoleMatrixEditor from "@/components/panel/roles/RoleMatrixEditor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roles" });
  return { title: t("title") };
}

export default async function RolesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  await requirePagePermission(locale, "ROLES", "VIEW");
  const t = await getTranslations("roles");
  const tNav = await getTranslations("panel.nav");

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: "ADMIN" },
    include: { permission: true },
  });
  const granted = new Set(rolePermissions.map((rp) => permissionKey(rp.permission.module, rp.permission.action)));

  const initialGrants = {} as Record<PermissionKey, boolean>;
  for (const mod of MODULES) {
    for (const action of ACTIONS) {
      const key = permissionKey(mod, action);
      initialGrants[key] = granted.has(key);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav("roles") }]} />

      <div>
        <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <RoleMatrixEditor initialGrants={initialGrants} />
      </div>
    </div>
  );
}
