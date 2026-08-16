import type { PermissionModule, RoleName } from "@/app/generated/prisma/client";
import { loadUserPermissions, permissionKey, type PermissionUser } from "@/lib/permissions";

export type NavItem = {
  key: string;
  href: string;
  module?: PermissionModule;
};

// Icon components are resolved client-side (see components/panel/nav-icons.ts)
// keyed by `key` below — Server Components can't pass React component
// references as props to Client Components, only plain serializable data.
const ADMIN_NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/panel/admin/dashboard", module: "DASHBOARD" },
  { key: "users", href: "/panel/admin/users", module: "USERS" },
  { key: "admins", href: "/panel/admin/admins", module: "ADMINS" },
  { key: "appointments", href: "/panel/admin/appointments", module: "APPOINTMENTS" },
  { key: "services", href: "/panel/admin/services", module: "SERVICES" },
  { key: "roles", href: "/panel/admin/roles", module: "ROLES" },
  { key: "auditLog", href: "/panel/admin/audit-log", module: "AUDIT_LOG" },
];

const ADMIN_TRAILING_ITEMS: NavItem[] = [
  { key: "consultations", href: "/panel/admin/consultations" },
  { key: "notifications", href: "/panel/notifications" },
  { key: "profile", href: "/panel/profile" },
];

const USER_NAV_ITEMS: NavItem[] = [
  { key: "myAppointments", href: "/panel/appointments" },
  { key: "consultations", href: "/panel/consultations" },
  { key: "notifications", href: "/panel/notifications" },
  { key: "profile", href: "/panel/profile" },
];

export async function getNavItems(user: PermissionUser & { role: RoleName }): Promise<NavItem[]> {
  if (user.role === "USER") return USER_NAV_ITEMS;

  if (user.role === "SUPER_ADMIN") return [...ADMIN_NAV_ITEMS, ...ADMIN_TRAILING_ITEMS];

  const permissions = await loadUserPermissions(user);
  const visible = ADMIN_NAV_ITEMS.filter(
    (item) => !item.module || permissions.has(permissionKey(item.module, "VIEW"))
  );
  return [...visible, ...ADMIN_TRAILING_ITEMS];
}
