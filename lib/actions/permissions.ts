"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAuthenticated } from "@/lib/actions/guard";
import { logAudit } from "@/lib/audit";
import { getRequestInfo } from "@/lib/request-info";
import { MODULES, ACTIONS } from "@/lib/permissions";

export type ActionResult = { ok: true } | { ok: false; error: string };

// Editing the permission matrix and per-admin overrides is inherently
// privilege-sensitive (it controls who can do what), so it's hardcoded to
// Super Admin rather than routed through the very table it edits.
async function requireSuperAdmin() {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;
  if (guard.session.user.role !== "SUPER_ADMIN") return { ok: false as const, error: "FORBIDDEN" };
  return guard;
}

const overrideSchema = z.object({
  userId: z.string().min(1),
  module: z.enum(MODULES),
  action: z.enum(ACTIONS),
  granted: z.boolean().nullable(), // null = remove override, use role default
});

export async function setUserPermissionOverrideAction(input: unknown): Promise<ActionResult> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const parsed = overrideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { userId, module, action, granted } = parsed.data;

  const permission = await prisma.permission.upsert({
    where: { module_action: { module, action } },
    update: {},
    create: { module, action },
  });

  if (granted === null) {
    await prisma.userPermission.deleteMany({ where: { userId, permissionId: permission.id } });
  } else {
    await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId: permission.id } },
      update: { granted },
      create: { userId, permissionId: permission.id, granted },
    });
  }

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "permission.override_change",
    targetType: "User",
    targetId: userId,
    metadata: { module, action, granted },
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/users/[id]", "page");
  return { ok: true };
}

const roleMatrixSchema = z.object({
  grants: z.array(z.object({ module: z.enum(MODULES), action: z.enum(ACTIONS), granted: z.boolean() })),
});

export async function updateAdminRoleMatrixAction(input: unknown): Promise<ActionResult> {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const parsed = roleMatrixSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  for (const grant of parsed.data.grants) {
    const permission = await prisma.permission.upsert({
      where: { module_action: { module: grant.module, action: grant.action } },
      update: {},
      create: { module: grant.module, action: grant.action },
    });

    if (grant.granted) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: "ADMIN", permissionId: permission.id } },
        update: {},
        create: { role: "ADMIN", permissionId: permission.id },
      });
    } else {
      await prisma.rolePermission.deleteMany({ where: { role: "ADMIN", permissionId: permission.id } });
    }
  }

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "role.matrix_update",
    targetType: "Role",
    targetId: "ADMIN",
    metadata: { grants: parsed.data.grants },
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/roles", "page");
  return { ok: true };
}
