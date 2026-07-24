"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardAuthenticated } from "@/lib/actions/guard";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordField, emailField, phoneField } from "@/lib/validation/auth";
import { logAudit } from "@/lib/audit";
import { getRequestInfo } from "@/lib/request-info";

export type ActionResult = { ok: true } | { ok: false; error: string };

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailField,
  phone: phoneField.optional().or(z.literal("")),
});

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };
  const { name, email, phone } = parsed.data;

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== guard.session.user.id) return { ok: false, error: "EMAIL_TAKEN" };

  await prisma.user.update({
    where: { id: guard.session.user.id },
    data: { name, email, phone: phone || null },
  });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.self_update",
    targetType: "User",
    targetId: guard.session.user.id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/profile", "page");
  return { ok: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordField,
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "MISMATCH", path: ["confirmPassword"] });

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.message === "MISMATCH");
    return { ok: false, error: mismatch ? "MISMATCH" : "INVALID_INPUT" };
  }

  const user = await prisma.user.findUnique({ where: { id: guard.session.user.id } });
  if (!user) return { ok: false, error: "NOT_FOUND" };

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { ok: false, error: "WRONG_CURRENT" };

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    // Keep the current session alive but kill every other one.
    prisma.session.deleteMany({
      where: { userId: user.id, sessionToken: { not: guard.session.sessionId ?? "" } },
    }),
  ]);

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: user.id,
    action: "user.change_password",
    targetType: "User",
    targetId: user.id,
    ip,
    userAgent,
  });

  return { ok: true };
}

export async function revokeSessionAction(sessionId: string): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  await prisma.session.deleteMany({ where: { id: sessionId, userId: guard.session.user.id } });

  revalidatePath("/[locale]/panel/profile", "page");
  return { ok: true };
}

export async function revokeAllOtherSessionsAction(): Promise<ActionResult> {
  const guard = await guardAuthenticated();
  if (!guard.ok) return guard;

  await prisma.session.deleteMany({
    where: { userId: guard.session.user.id, sessionToken: { not: guard.session.sessionId ?? "" } },
  });

  const { ip, userAgent } = await getRequestInfo();
  await logAudit({
    actorId: guard.session.user.id,
    action: "user.revoke_all_sessions",
    targetType: "User",
    targetId: guard.session.user.id,
    ip,
    userAgent,
  });

  revalidatePath("/[locale]/panel/profile", "page");
  return { ok: true };
}
