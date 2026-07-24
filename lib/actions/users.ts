"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardPermission, guardAuthenticated } from "@/lib/actions/guard";
import { hashPassword } from "@/lib/password";
import { generateRawToken, hashToken, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { logAudit } from "@/lib/audit";
import { getRequestInfo } from "@/lib/request-info";
import { countActiveSuperAdmins } from "@/lib/data/users";
import { emailField, phoneField, passwordField } from "@/lib/validation/auth";
import type { RoleName, UserStatus, PermissionModule } from "@/app/generated/prisma/client";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export type ActionResult = { ok: true } | { ok: false; error: string };

function moduleForRole(role: RoleName): PermissionModule {
  return role === "ADMIN" || role === "SUPER_ADMIN" ? "ADMINS" : "USERS";
}

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailField,
  phone: phoneField.optional().or(z.literal("")),
  password: passwordField,
  role: z.enum(["USER", "ADMIN"]),
});

export async function createUserAction(input: unknown): Promise<ActionResult> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const { name, email, phone, password, role } = parsed.data;
  const targetModule = moduleForRole(role);
  const guard = await guardPermission(targetModule, "CREATE");
  if (!guard.ok) return guard;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "EMAIL_TAKEN" };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.create",
    targetType: "User",
    targetId: user.id,
    metadata: { role },
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/users", "page");
  revalidatePath("/[locale]/panel/admin/admins", "page");
  return { ok: true };
}

const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  email: emailField,
  phone: phoneField.optional().or(z.literal("")),
});

export async function updateUserAction(input: unknown): Promise<ActionResult> {
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const { id, name, email, phone } = parsed.data;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  const guard = await guardPermission(moduleForRole(target.role), "EDIT");
  if (!guard.ok) return guard;

  if (target.role === "SUPER_ADMIN" && guard.session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "CANNOT_MODIFY_SUPER_ADMIN" };
  }

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== id) return { ok: false, error: "EMAIL_TAKEN" };

  await prisma.user.update({
    where: { id },
    data: { name, email, phone: phone || null },
  });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.update",
    targetType: "User",
    targetId: id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/users/[id]", "page");
  return { ok: true };
}

const changeRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
});

export async function changeUserRoleAction(input: unknown): Promise<ActionResult> {
  const parsed = changeRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { id, role } = parsed.data;

  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;
  // Role changes are privilege-sensitive enough to hardcode to Super Admin
  // rather than route through the configurable permission table.
  if (guard.session.user.role !== "SUPER_ADMIN") return { ok: false, error: "FORBIDDEN" };
  if (guard.session.user.id === id) return { ok: false, error: "CANNOT_MODIFY_SELF" };

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  if (target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const remaining = await countActiveSuperAdmins(id);
    if (remaining < 1) return { ok: false, error: "LAST_SUPER_ADMIN" };
  }

  await prisma.user.update({ where: { id }, data: { role } });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.role_change",
    targetType: "User",
    targetId: id,
    metadata: { from: target.role, to: role },
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/users/[id]", "page");
  revalidatePath("/[locale]/panel/admin/users", "page");
  revalidatePath("/[locale]/panel/admin/admins", "page");
  return { ok: true };
}

const changeStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "BLOCKED", "INACTIVE"]),
});

export async function changeUserStatusAction(input: unknown): Promise<ActionResult> {
  const parsed = changeStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { id, status } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  const guard = await guardPermission(moduleForRole(target.role), "EDIT");
  if (!guard.ok) return guard;

  if (guard.session.user.id === id) return { ok: false, error: "CANNOT_MODIFY_SELF" };
  if (target.role === "SUPER_ADMIN" && guard.session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "CANNOT_MODIFY_SUPER_ADMIN" };
  }
  if (target.role === "SUPER_ADMIN" && status !== "ACTIVE") {
    const remaining = await countActiveSuperAdmins(id);
    if (remaining < 1) return { ok: false, error: "LAST_SUPER_ADMIN" };
  }

  await applyStatusChange(id, status, guard.session.user.id);

  revalidatePath("/[locale]/panel/admin/users/[id]", "page");
  revalidatePath("/[locale]/panel/admin/users", "page");
  revalidatePath("/[locale]/panel/admin/admins", "page");
  return { ok: true };
}

async function applyStatusChange(id: string, status: UserStatus, actorId: string) {
  await prisma.user.update({ where: { id }, data: { status } });
  if (status !== "ACTIVE") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId,
    action: "user.status_change",
    targetType: "User",
    targetId: id,
    metadata: { status },
    ip,
    userAgent,
  });
}

export async function sendUserResetLinkAction(id: string): Promise<ActionResult> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  const guard = await guardPermission(moduleForRole(target.role), "EDIT");
  if (!guard.ok) return guard;
  if (target.role === "SUPER_ADMIN" && guard.session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "CANNOT_MODIFY_SUPER_ADMIN" };
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: target.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  const rawToken = generateRawToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: target.id,
      tokenHash: hashToken(rawToken),
      expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    },
  });

  await sendPasswordResetEmail(
    target.email,
    target.locale,
    `${APP_URL}/${target.locale}/reset-password/${rawToken}`
  );

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.reset_link_sent",
    targetType: "User",
    targetId: id,
    ip,
    userAgent,
  });

  return { ok: true };
}

export async function forceLogoutUserAction(id: string): Promise<ActionResult> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  const guard = await guardPermission(moduleForRole(target.role), "MANAGE");
  if (!guard.ok) return guard;
  if (target.role === "SUPER_ADMIN" && guard.session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "CANNOT_MODIFY_SUPER_ADMIN" };
  }

  await prisma.session.deleteMany({ where: { userId: id } });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.force_logout",
    targetType: "User",
    targetId: id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/users/[id]", "page");
  return { ok: true };
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "NOT_FOUND" };

  const guard = await guardPermission(moduleForRole(target.role), "DELETE");
  if (!guard.ok) return guard;
  if (guard.session.user.id === id) return { ok: false, error: "CANNOT_MODIFY_SELF" };
  if (target.role === "SUPER_ADMIN") {
    if (guard.session.user.role !== "SUPER_ADMIN") return { ok: false, error: "CANNOT_MODIFY_SUPER_ADMIN" };
    const remaining = await countActiveSuperAdmins(id);
    if (remaining < 1) return { ok: false, error: "LAST_SUPER_ADMIN" };
  }

  await prisma.user.delete({ where: { id } });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.delete",
    targetType: "User",
    targetId: id,
    metadata: { email: target.email, role: target.role },
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/admin/users", "page");
  revalidatePath("/[locale]/panel/admin/admins", "page");
  return { ok: true };
}

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
});

export async function bulkChangeStatusAction(input: unknown, status: UserStatus): Promise<ActionResult> {
  const parsed = bulkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const targets = await prisma.user.findMany({ where: { id: { in: parsed.data.ids } } });
  for (const target of targets) {
    if (target.id === guard.session.user.id) continue;
    if (target.role === "SUPER_ADMIN" && guard.session.user.role !== "SUPER_ADMIN") continue;
    const allowed = await guardPermission(moduleForRole(target.role), "EDIT");
    if (!allowed.ok) continue;
    await applyStatusChange(target.id, status, guard.session.user.id);
  }

  revalidatePath("/[locale]/panel/admin/users", "page");
  revalidatePath("/[locale]/panel/admin/admins", "page");
  return { ok: true };
}

export async function bulkDeleteAction(input: unknown): Promise<ActionResult> {
  const parsed = bulkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const targets = await prisma.user.findMany({ where: { id: { in: parsed.data.ids } } });
  for (const target of targets) {
    if (target.id === guard.session.user.id) continue;
    if (target.role === "SUPER_ADMIN") continue; // never bulk-delete a Super Admin
    const allowed = await guardPermission(moduleForRole(target.role), "DELETE");
    if (!allowed.ok) continue;
    await prisma.user.delete({ where: { id: target.id } });
    const { ip, userAgent } = await getRequestInfo();
    await logAudit({
      actorId: guard.session.user.id,
      action: "user.delete",
      targetType: "User",
      targetId: target.id,
      metadata: { email: target.email, role: target.role, bulk: true },
      ip,
      userAgent,
    });
  }

  revalidatePath("/[locale]/panel/admin/users", "page");
  return { ok: true };
}

export async function exportUsersCsvAction(scope: "all" | "admins"): Promise<{ ok: true; csv: string } | { ok: false; error: string }> {
  const guard = await guardPermission(scope === "admins" ? "ADMINS" : "USERS", "EXPORT");
  if (!guard.ok) return guard;

  const users = await prisma.user.findMany({
    where: scope === "admins" ? { role: { in: ["ADMIN", "SUPER_ADMIN"] } } : {},
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, phone: true, role: true, status: true, createdAt: true, lastLoginAt: true },
  });

  const header = ["Name", "Email", "Phone", "Role", "Status", "Joined", "Last Login"];
  const rows = users.map((u) => [
    u.name,
    u.email,
    u.phone ?? "",
    u.role,
    u.status,
    u.createdAt.toISOString(),
    u.lastLoginAt?.toISOString() ?? "",
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.export",
    targetType: "User",
    metadata: { scope, count: users.length },
    ip,
    userAgent,
  });

  return { ok: true, csv };
}
