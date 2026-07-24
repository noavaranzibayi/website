import { getTranslations } from "next-intl/server";
import type { RoleName, UserStatus } from "@/app/generated/prisma/client";
import { requirePagePermission } from "@/lib/page-guard";
import { hasPermission } from "@/lib/permissions";
import { queryUsers } from "@/lib/data/users";
import Breadcrumb from "@/components/panel/Breadcrumb";
import UsersFilters from "@/components/panel/users/UsersFilters";
import UsersTable from "@/components/panel/users/UsersTable";
import CreateUserDialog from "@/components/panel/users/CreateUserDialog";
import ExportUsersButton from "@/components/panel/users/ExportUsersButton";
import Pagination from "@/components/panel/shared/Pagination";

export default async function UsersListView({
  locale,
  scope,
  searchParams,
}: {
  locale: string;
  scope: "all" | "admins";
  searchParams: { q?: string; role?: string; status?: string; page?: string };
}) {
  const permModule = scope === "admins" ? "ADMINS" : "USERS";
  const session = await requirePagePermission(locale, permModule, "VIEW");
  const t = await getTranslations("users");
  const tNav = await getTranslations("panel.nav");

  const [canCreate, canEdit, canDelete, canManage, canExport] = await Promise.all([
    hasPermission(session.user, permModule, "CREATE"),
    hasPermission(session.user, permModule, "EDIT"),
    hasPermission(session.user, permModule, "DELETE"),
    hasPermission(session.user, permModule, "MANAGE"),
    hasPermission(session.user, permModule, "EXPORT"),
  ]);

  const page = Number(searchParams.page) || 1;
  const result = await queryUsers({
    q: searchParams.q,
    role: searchParams.role as RoleName | undefined,
    status: searchParams.status as UserStatus | undefined,
    page,
    scope,
  });

  const basePath = scope === "admins" ? "/panel/admin/admins" : "/panel/admin/users";

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: tNav(scope === "admins" ? "admins" : "users") }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800 dark:text-white sm:text-2xl">
            {scope === "admins" ? t("adminsTitle") : t("title")}
          </h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
            {scope === "admins" ? t("adminsSubtitle") : t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && <ExportUsersButton scope={scope} />}
          {canCreate && <CreateUserDialog role={scope === "admins" ? "ADMIN" : "USER"} />}
        </div>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <UsersFilters
          basePath={basePath}
          initialQuery={searchParams.q}
          initialRole={searchParams.role}
          initialStatus={searchParams.status}
          showRoleFilter={scope === "all"}
        />
        <UsersTable
          rows={result.items}
          currentUserId={session.user.id}
          currentUserRole={session.user.role as RoleName}
          canEdit={canEdit}
          canDelete={canDelete}
          canManage={canManage}
        />
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
