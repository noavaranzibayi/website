import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { RoleName } from "@/app/generated/prisma/client";
import { MODULES, ACTIONS, permissionKey, type PermissionKey } from "@/lib/rbac-constants";
import type { PermissionModule, PermissionAction } from "@/app/generated/prisma/client";

export { MODULES, ACTIONS, permissionKey, type PermissionKey };

export type PermissionUser = { id: string; role: RoleName };

/**
 * Loads the full effective permission set for a user in a single query:
 * role defaults, with per-user overrides taking precedence. Wrapped in
 * React's `cache()` so multiple checks during the same request/render pass
 * only hit the database once. SUPER_ADMIN always resolves to "grant all"
 * without a lookup, so a misconfigured permission table can never lock out
 * the top-level admin.
 */
export const loadUserPermissions = cache(async (user: PermissionUser): Promise<Set<PermissionKey>> => {
  if (user.role === "SUPER_ADMIN") {
    const all = new Set<PermissionKey>();
    for (const mod of MODULES) {
      for (const action of ACTIONS) {
        all.add(permissionKey(mod, action));
      }
    }
    return all;
  }

  const permissions = await prisma.permission.findMany({
    select: {
      module: true,
      action: true,
      rolePermissions: { where: { role: user.role }, select: { id: true } },
      userPermissions: { where: { userId: user.id }, select: { granted: true } },
    },
  });

  const granted = new Set<PermissionKey>();
  for (const permission of permissions) {
    const key = permissionKey(permission.module, permission.action);
    const override = permission.userPermissions[0];
    const isGranted = override ? override.granted : permission.rolePermissions.length > 0;
    if (isGranted) granted.add(key);
  }
  return granted;
});

export async function hasPermission(
  user: PermissionUser | null | undefined,
  mod: PermissionModule,
  action: PermissionAction
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  const permissions = await loadUserPermissions(user);
  return permissions.has(permissionKey(mod, action));
}

export class PermissionError extends Error {
  module: PermissionModule;
  action: PermissionAction;
  constructor(mod: PermissionModule, action: PermissionAction) {
    super(`Permission denied: ${mod}:${action}`);
    this.name = "PermissionError";
    this.module = mod;
    this.action = action;
  }
}

export async function requirePermission(
  user: PermissionUser | null | undefined,
  mod: PermissionModule,
  action: PermissionAction
): Promise<void> {
  if (!(await hasPermission(user, mod, action))) {
    throw new PermissionError(mod, action);
  }
}
