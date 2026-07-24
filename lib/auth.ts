import { randomBytes } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { RoleName, UserStatus, Locale } from "@/app/generated/prisma/client";

// Credentials provider requires the JWT session strategy (Auth.js does not
// support database sessions with Credentials). To still get real session
// management (list active sessions, force logout a device, force logout
// everywhere) we keep our own lightweight session registry in the `Session`
// table: authorize() creates a row and stamps its id into the token as
// `sid`; the jwt callback re-validates that row on every request and also
// refreshes role/status/locale from the User table, so admin actions like
// suspending a user or revoking a session take effect immediately instead
// of waiting for the token to expire.
//
// next-auth v5 re-exports its public types from @auth/core rather than
// declaring them locally, which makes cross-package `declare module`
// augmentation resolve inconsistently in a pnpm workspace. Rather than
// fight that, this file owns the extra claims via local casts, and the
// rest of the app reads sessions through the fully-typed lib/session.ts
// helpers instead of next-auth's raw types.
type AppUser = {
  id: string;
  role: RoleName;
  status: UserStatus;
  locale: Locale;
  sid: string;
};

type AppToken = {
  id?: string;
  role?: RoleName;
  status?: UserStatus | "SESSION_REVOKED";
  locale?: Locale;
  sid?: string;
};

const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30-day ceiling — see loginAction for the "remember me" cookie logic.

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SEC,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : null;
        const password = typeof credentials?.password === "string" ? credentials.password : null;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) return null;
        if (user.status !== "ACTIVE" && user.status !== "PENDING_VERIFICATION") return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          const failedLoginCount = user.failedLoginCount + 1;
          const lockedUntil = failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount, lockedUntil },
          });
          return null;
        }

        if (user.status === "PENDING_VERIFICATION") return null;

        const forwardedFor = request?.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request?.headers.get("x-real-ip") ?? null);
        const userAgent = request?.headers.get("user-agent") ?? null;
        const sid = randomBytes(24).toString("hex");

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
          }),
          prisma.session.create({
            data: {
              sessionToken: sid,
              userId: user.id,
              expires: new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000),
              ip,
              userAgent,
            },
          }),
        ]);

        const appUser: AppUser = {
          id: user.id,
          role: user.role,
          status: user.status,
          locale: user.locale,
          sid,
        };

        return {
          email: user.email,
          name: user.name,
          image: user.image,
          ...appUser,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as typeof token & AppToken;

      if (user) {
        const u = user as unknown as AppUser;
        t.id = u.id;
        t.role = u.role;
        t.status = u.status;
        t.locale = u.locale;
        t.sid = u.sid;
        return t;
      }

      if (!t.sid) {
        t.status = "SESSION_REVOKED";
        return t;
      }

      const dbSession = await prisma.session.findUnique({
        where: { sessionToken: t.sid },
        select: {
          expires: true,
          user: { select: { role: true, status: true, locale: true } },
        },
      });

      if (!dbSession || dbSession.expires < new Date()) {
        t.status = "SESSION_REVOKED";
        return t;
      }

      t.role = dbSession.user.role;
      t.status = dbSession.user.status;
      t.locale = dbSession.user.locale;
      return t;
    },
    async session({ session, token }) {
      const t = token as typeof token & AppToken;
      type SessionUserExtra = {
        id: string;
        role: RoleName;
        status: UserStatus | "SESSION_REVOKED";
        locale: Locale;
      };
      const s = session as typeof session & { sessionId?: string; user: typeof session.user & SessionUserExtra };
      s.sessionId = t.sid;
      s.user.id = t.id ?? "";
      s.user.role = t.role ?? "USER";
      s.user.status = t.status ?? "SESSION_REVOKED";
      s.user.locale = t.locale ?? "fa";
      return s;
    },
  },
});
