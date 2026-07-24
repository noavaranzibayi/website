import { auth } from "@/lib/auth";
import type { RoleName, UserStatus, Locale } from "@/app/generated/prisma/client";

export type AppSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: RoleName;
  status: UserStatus | "SESSION_REVOKED";
  locale: Locale;
};

export type AppSession = { sessionId?: string; user: AppSessionUser };

/**
 * Typed accessor for the current session. Prefer this over importing
 * `auth` directly — see the comment in lib/auth.ts for why the extra
 * claims (role/status/locale/sid) are attached via local casts rather
 * than next-auth module augmentation.
 */
export async function getSession(): Promise<AppSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as unknown as AppSession;
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export function isActiveSession(session: AppSession | null): session is AppSession & { user: { status: "ACTIVE" } } {
  return session?.user.status === "ACTIVE";
}
