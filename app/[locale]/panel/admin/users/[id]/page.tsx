import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { PermissionModule } from "@/app/generated/prisma/client";
import { getSession } from "@/lib/session";
import { hasPermission, MODULES, ACTIONS, type PermissionKey } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  getUserById,
  getUserSessions,
  getUserAuditLog,
  getUserAppointments,
} from "@/lib/data/users";
import Breadcrumb from "@/components/panel/Breadcrumb";
import { RoleBadge } from "@/components/panel/shared/Badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserOverviewForm from "@/components/panel/users/UserOverviewForm";
import UserActionsPanel from "@/components/panel/users/UserActionsPanel";
import UserPermissionsPanel, { type PermissionCell } from "@/components/panel/users/UserPermissionsPanel";
import UserSessionsPanel from "@/components/panel/users/UserSessionsPanel";
import UserActivityPanel from "@/components/panel/users/UserActivityPanel";
import UserAppointmentsPanel from "@/components/panel/users/UserAppointmentsPanel";

function moduleForRole(role: string): PermissionModule {
  return role === "ADMIN" || role === "SUPER_ADMIN" ? "ADMINS" : "USERS";
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") redirect(`/${locale}/login`);

  const target = await getUserById(id);
  if (!target) notFound();

  const targetModule = moduleForRole(target.role);
  const allowedView = await hasPermission(session.user, targetModule, "VIEW");
  if (!allowedView) redirect(`/${locale}/403`);

  const [canEdit, canDelete, canManage, appointments] = await Promise.all([
    hasPermission(session.user, targetModule, "EDIT"),
    hasPermission(session.user, targetModule, "DELETE"),
    hasPermission(session.user, targetModule, "MANAGE"),
    getUserAppointments(target.id),
  ]);

  const isSuperAdminTarget = target.role === "SUPER_ADMIN";
  const lockedForActor = isSuperAdminTarget && session.user.role !== "SUPER_ADMIN";
  const isSelf = session.user.id === target.id;

  const t = await getTranslations("users");
  const tNav = await getTranslations("panel.nav");
  const initials = target.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const isSuperAdminActor = session.user.role === "SUPER_ADMIN";

  let permissionMatrix: Record<PermissionKey, PermissionCell> | null = null;
  if (isSuperAdminActor && target.role !== "SUPER_ADMIN") {
    const [rolePermissions, userPermissions] = await Promise.all([
      prisma.rolePermission.findMany({ where: { role: target.role }, include: { permission: true } }),
      prisma.userPermission.findMany({ where: { userId: target.id }, include: { permission: true } }),
    ]);
    const roleDefaults = new Set(rolePermissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`));
    const overrides = new Map(userPermissions.map((up) => [`${up.permission.module}:${up.permission.action}`, up.granted]));

    permissionMatrix = {} as Record<PermissionKey, PermissionCell>;
    for (const mod of MODULES) {
      for (const action of ACTIONS) {
        const key = `${mod}:${action}` as PermissionKey;
        permissionMatrix[key] = {
          roleDefault: roleDefaults.has(key),
          override: overrides.has(key) ? (overrides.get(key) as boolean) : null,
        };
      }
    }
  }

  const sessions = canManage || isSelf ? await getUserSessions(target.id) : [];
  const activity = await getUserAuditLog(target.id);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: tNav(targetModule === "ADMINS" ? "admins" : "users"), href: targetModule === "ADMINS" ? "/panel/admin/admins" : "/panel/admin/users" },
          { label: target.name },
        ]}
      />

      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {target.image && <AvatarImage src={target.image} alt={target.name} />}
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-navy-800 dark:text-white">{target.name}</h1>
            <RoleBadge role={target.role} />
          </div>
          <p className="text-sm text-navy-400" dir="ltr">
            {target.email}
          </p>
        </div>
      </div>

      {lockedForActor && (
        <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-navy-700 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-200">
          {t("confirm.cannotModifySuperAdmin")}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
              {permissionMatrix && <TabsTrigger value="permissions">{t("tabs.permissions")}</TabsTrigger>}
              <TabsTrigger value="sessions">{t("tabs.sessions")}</TabsTrigger>
              <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
              <TabsTrigger value="appointments">{t("tabs.appointments")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <UserOverviewForm
                id={target.id}
                name={target.name}
                email={target.email}
                phone={target.phone}
                role={target.role}
                canEdit={canEdit && !lockedForActor}
                canChangeRole={isSuperAdminActor && !isSelf}
                isSelf={isSelf}
              />
            </TabsContent>

            {permissionMatrix && (
              <TabsContent value="permissions">
                <UserPermissionsPanel userId={target.id} matrix={permissionMatrix} />
              </TabsContent>
            )}

            <TabsContent value="sessions">
              <UserSessionsPanel sessions={sessions} />
            </TabsContent>

            <TabsContent value="activity">
              <UserActivityPanel items={activity} />
            </TabsContent>

            <TabsContent value="appointments">
              <UserAppointmentsPanel items={appointments} />
            </TabsContent>
          </Tabs>
        </div>

        <UserActionsPanel
          id={target.id}
          status={target.status}
          canEdit={canEdit && !lockedForActor && !isSelf}
          canManage={canManage && !lockedForActor && !isSelf}
          canDelete={canDelete && !lockedForActor && !isSelf}
        />
      </div>
    </div>
  );
}
