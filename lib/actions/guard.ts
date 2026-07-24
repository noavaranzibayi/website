import { getSession, type AppSession } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";
import type { PermissionModule, PermissionAction } from "@/app/generated/prisma/client";

export type GuardResult = { ok: true; session: AppSession } | { ok: false; error: string };

/**
 * Server-side permission gate for actions/route handlers. This is the real
 * enforcement layer — the UI hides buttons the user can't use for clarity,
 * but every mutation is re-checked here regardless of what the client sent,
 * so hiding a button is never the only thing standing between a user and an
 * unauthorized action.
 */
export async function guardPermission(mod: PermissionModule, action: PermissionAction): Promise<GuardResult> {
  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") {
    return { ok: false, error: "UNAUTHENTICATED" };
  }
  const allowed = await hasPermission(session.user, mod, action);
  if (!allowed) {
    return { ok: false, error: "FORBIDDEN" };
  }
  return { ok: true, session };
}

export async function guardAuthenticated(): Promise<GuardResult> {
  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") {
    return { ok: false, error: "UNAUTHENTICATED" };
  }
  return { ok: true, session };
}
