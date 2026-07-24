import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { routing, locales, defaultLocale } from "@/i18n/routing";
import type { AppSession } from "@/lib/session";

const intlMiddleware = createIntlMiddleware(routing);

const PANEL_PREFIX = "/panel";
const ADMIN_PREFIX = "/panel/admin";
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

function stripLocale(pathname: string): { locale: string; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  if ((locales as readonly string[]).includes(maybeLocale)) {
    const rest = "/" + segments.slice(1).join("/");
    return { locale: maybeLocale, rest: rest === "/" ? "/" : rest.replace(/\/$/, "") };
  }
  return { locale: defaultLocale, rest: pathname.replace(/\/$/, "") || "/" };
}

function matches(rest: string, prefix: string) {
  return rest === prefix || rest.startsWith(prefix + "/");
}

export default auth((req) => {
  const { nextUrl } = req;
  const { locale, rest } = stripLocale(nextUrl.pathname);
  const session = req.auth as AppSession | null;

  const isPanel = matches(rest, PANEL_PREFIX);
  const isAdminPanel = matches(rest, ADMIN_PREFIX);
  const isAuthPage = AUTH_PAGES.some((page) => matches(rest, page));

  if (isPanel && !session?.user) {
    const url = new URL(`/${locale}/login`, nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isPanel && session?.user && session.user.status !== "ACTIVE") {
    const url = new URL(`/${locale}/login`, nextUrl);
    url.searchParams.set("error", "account_disabled");
    return NextResponse.redirect(url);
  }

  if (isAdminPanel && session?.user && session.user.role === "USER") {
    return NextResponse.redirect(new URL(`/${locale}/403`, nextUrl));
  }

  if (isAuthPage && session?.user && session.user.status === "ACTIVE") {
    return NextResponse.redirect(new URL(`/${locale}/panel`, nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
