import { cookies } from "next/headers";

// Auth.js's default cookie naming (see @auth/core lib/utils/cookie.ts).
// Mirrored here so we can rewrite the cookie it just set.
function isSecureCookieContext(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  return Boolean(process.env.AUTH_URL?.startsWith("https://"));
}

function sessionCookieName(): string {
  return `${isSecureCookieContext() ? "__Secure-" : ""}authjs.session-token`;
}

/**
 * Auth.js's `session.maxAge` config is static, so every sign-in gets a
 * cookie with the same (long) Max-Age. To implement "remember me" we let
 * that long-lived cookie stand when the user opted in, and otherwise
 * downgrade it to a browser session cookie (no Max-Age — cleared when the
 * browser closes) right after signIn() completes, in the same request.
 */
export async function applyRememberMeCookie(remember: boolean) {
  if (remember) return;

  const store = await cookies();
  const name = sessionCookieName();
  const existing = store.get(name);
  if (!existing) return;

  store.set(name, existing.value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecureCookieContext(),
    // No `maxAge` / `expires` — makes this a session-only cookie.
  });
}
