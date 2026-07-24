import type { PermissionModule, PermissionAction } from "@/app/generated/prisma/client";

// Pure constants/types shared by server AND client code. Kept separate from
// lib/permissions.ts (which imports the Prisma client) so client components
// can import just this and never pull server-only DB code into their bundle.

export const MODULES = [
  "DASHBOARD",
  "USERS",
  "ADMINS",
  "ROLES",
  "APPOINTMENTS",
  "NOTIFICATIONS",
  "AUDIT_LOG",
  "SETTINGS",
] as const satisfies readonly PermissionModule[];

export const ACTIONS = [
  "VIEW",
  "CREATE",
  "EDIT",
  "DELETE",
  "APPROVE",
  "MANAGE",
  "EXPORT",
] as const satisfies readonly PermissionAction[];

export type PermissionKey = `${PermissionModule}:${PermissionAction}`;

export function permissionKey(mod: PermissionModule, action: PermissionAction): PermissionKey {
  return `${mod}:${action}`;
}
