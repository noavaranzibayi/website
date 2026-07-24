"use server";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { applyRememberMeCookie } from "@/lib/session-cookie";
import { hashPassword } from "@/lib/password";
import { generateRawToken, hashToken, EMAIL_VERIFICATION_TOKEN_TTL_MS, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/tokens";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getRequestInfo } from "@/lib/request-info";
import { logAudit } from "@/lib/audit";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mailer";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "@/lib/validation/auth";
import type { Locale } from "@/i18n/routing";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fail(error: string): ActionResult {
  return { ok: false, error };
}

export async function loginAction(input: unknown): Promise<ActionResult & { redirectTo?: string }> {
  const t = await getTranslations("auth.login.errors");
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail(t("generic"));

  const { email, password, remember, callbackUrl, locale } = parsed.data;
  const { ip, userAgent } = await getRequestInfo();

  const ipLimit = await checkRateLimit(`login:ip:${ip ?? "unknown"}`, RATE_LIMITS.login);
  const emailLimit = await checkRateLimit(`login:email:${email}`, RATE_LIMITS.login);
  if (!ipLimit.allowed || !emailLimit.allowed) return fail(t("rateLimited"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail(t("invalidCredentials"));

  if (user.lockedUntil && user.lockedUntil > new Date()) return fail(t("accountLocked"));
  if (user.status === "BLOCKED") return fail(t("accountBlocked"));
  if (user.status === "SUSPENDED") return fail(t("accountSuspended"));
  if (user.status === "INACTIVE") return fail(t("accountInactive"));
  if (user.status === "PENDING_VERIFICATION") return fail(t("emailNotVerified"));

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return fail(t("invalidCredentials"));
  }

  await applyRememberMeCookie(remember);

  await logAudit({
    actorId: user.id,
    action: "user.login",
    targetType: "User",
    targetId: user.id,
    ip,
    userAgent,
  });

  // Locale-free path: the client uses next-intl's locale-aware router, which
  // prepends the current locale itself — returning an already-prefixed path
  // here would double it up (e.g. /fa/fa/panel).
  const localePrefix = `/${locale}`;
  const unprefixedCallback =
    callbackUrl && callbackUrl.startsWith(`${localePrefix}/panel`)
      ? callbackUrl.slice(localePrefix.length)
      : "/panel";
  return { ok: true, redirectTo: unprefixedCallback };
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  const t = await getTranslations("auth.register.errors");
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const passwordMismatch = parsed.error.issues.some((i) => i.message === "password_mismatch");
    const weakPassword = parsed.error.issues.some((i) => i.message === "weak_password");
    if (passwordMismatch) return fail(t("passwordMismatch"));
    if (weakPassword) return fail(t("weakPassword"));
    return fail(t("generic"));
  }

  const { name, email, phone, password, locale } = parsed.data;
  const { ip, userAgent } = await getRequestInfo();

  const rateLimit = await checkRateLimit(`register:ip:${ip ?? "unknown"}`, RATE_LIMITS.register);
  if (!rateLimit.allowed) return fail(t("rateLimited"));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail(t("emailTaken"));

  const passwordHash = await hashPassword(password);

  // Role is always USER here — there is no role field in this form, and this
  // is the only code path that creates accounts from the public register
  // page, so a client can never elevate itself to ADMIN/SUPER_ADMIN.
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "USER",
      status: "PENDING_VERIFICATION",
      locale,
    },
  });

  const rawToken = generateRawToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    },
  });

  sendVerificationEmail(email, locale as Locale, `${APP_URL}/${locale}/verify-email/${rawToken}`).catch((error) =>
    console.error("[auth] verification email failed:", error)
  );

  await logAudit({
    actorId: user.id,
    action: "user.register",
    targetType: "User",
    targetId: user.id,
    ip,
    userAgent,
  });

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  const { ip, userAgent } = await getRequestInfo();
  if (session?.user) {
    if (session.sessionId) {
      await prisma.session.deleteMany({ where: { sessionToken: session.sessionId } });
    }
    await logAudit({
      actorId: session.user.id,
      action: "user.logout",
      targetType: "User",
      targetId: session.user.id,
      ip,
      userAgent,
    });
  }
  await signOut({ redirect: false });
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const t = await getTranslations("auth.forgotPassword");
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fail(t("rateLimited"));

  const { email, locale } = parsed.data;
  const { ip } = await getRequestInfo();

  const ipLimit = await checkRateLimit(`forgot-password:ip:${ip ?? "unknown"}`, RATE_LIMITS.forgotPassword);
  const emailLimit = await checkRateLimit(`forgot-password:email:${email}`, RATE_LIMITS.forgotPassword);
  if (!ipLimit.allowed || !emailLimit.allowed) return fail(t("rateLimited"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = generateRawToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
        requestIp: ip,
      },
    });

    sendPasswordResetEmail(email, locale as Locale, `${APP_URL}/${locale}/reset-password/${rawToken}`).catch(
      (error) => console.error("[auth] password reset email failed:", error)
    );

    await logAudit({
      actorId: user.id,
      action: "user.password_reset_requested",
      targetType: "User",
      targetId: user.id,
      ip,
    });
  }

  // Always succeed with a generic message — never reveal whether the email exists.
  return { ok: true };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult & { invalid?: boolean }> {
  const t = await getTranslations("auth.resetPassword");
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const passwordMismatch = parsed.error.issues.some((i) => i.message === "password_mismatch");
    const weakPassword = parsed.error.issues.some((i) => i.message === "weak_password");
    if (passwordMismatch) return fail(t("errors.passwordMismatch"));
    if (weakPassword) return fail(t("errors.weakPassword"));
    return fail(t("errors.generic"));
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!resetToken || resetToken.usedAt || resetToken.expires < new Date()) {
    return { ok: false, error: t("invalidTokenDescription"), invalid: true };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Password changed — force re-authentication everywhere.
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  await logAudit({
    actorId: resetToken.userId,
    action: "user.password_reset",
    targetType: "User",
    targetId: resetToken.userId,
  });

  return { ok: true };
}

export async function verifyEmailToken(token: string): Promise<ActionResult> {
  const t = await getTranslations("auth.verifyEmail");
  const tokenHash = hashToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!verificationToken || verificationToken.usedAt || verificationToken.expires < new Date()) {
    return fail(t("invalidTokenDescription"));
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.user.updateMany({
      where: { id: verificationToken.userId, status: "PENDING_VERIFICATION" },
      data: { status: "ACTIVE" },
    }),
  ]);

  await logAudit({
    actorId: verificationToken.userId,
    action: "user.email_verified",
    targetType: "User",
    targetId: verificationToken.userId,
  });

  return { ok: true };
}

export async function resendVerificationAction(input: unknown): Promise<ActionResult> {
  const t = await getTranslations("auth.verifyEmail");
  const parsed = resendVerificationSchema.safeParse(input);
  if (!parsed.success) return fail(t("resendRateLimited"));

  const { email, locale } = parsed.data;
  const { ip } = await getRequestInfo();

  const ipLimit = await checkRateLimit(`resend-verification:ip:${ip ?? "unknown"}`, RATE_LIMITS.resendVerification);
  const emailLimit = await checkRateLimit(`resend-verification:email:${email}`, RATE_LIMITS.resendVerification);
  if (!ipLimit.allowed || !emailLimit.allowed) return fail(t("resendRateLimited"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "PENDING_VERIFICATION") {
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = generateRawToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
      },
    });

    sendVerificationEmail(email, locale as Locale, `${APP_URL}/${locale}/verify-email/${rawToken}`).catch((error) =>
      console.error("[auth] verification email failed:", error)
    );
  }

  return { ok: true };
}
