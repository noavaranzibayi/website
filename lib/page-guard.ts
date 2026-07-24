import { redirect } from "next/navigation";
import { getSession, type AppSession } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";
import type { PermissionModule, PermissionAction } from "@/app/generated/prisma/client";

/**
 * Page-level guard: redirects to /login or /403 as appropriate. This is a
 * second, independent enforcement layer on top of the proxy middleware and
 * the server actions' own guards — a page should never render admin data
 * just because the sidebar happened to hide the link to it.
 */
export async function requirePagePermission(
  locale: string,
  mod: PermissionModule,
  action: PermissionAction
): Promise<AppSession> {
  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") {
    redirect(`/${locale}/login`);
  }
  const allowed = await hasPermission(session.user, mod, action);
  if (!allowed) {
    redirect(`/${locale}/403`);
  }
  return session;
}

export async function requirePageSession(locale: string): Promise<AppSession> {
  const session = await getSession();
  if (!session || session.user.status !== "ACTIVE") {
    redirect(`/${locale}/login`);
  }
  return session;
}
