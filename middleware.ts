import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

// Public paths that don't require authentication (without locale prefix)
const PUBLIC_PATHS = ["/", "/jobs", "/companies", "/auth", "/pricing", "/salaries", "/seekers", "/about", "/privacy"];

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix if present (e.g., /en/jobs → /jobs)
  const strippedPath = pathname.replace(/^\/(ka|en)/, "") || "/";
  return PUBLIC_PATHS.some(
    (p) => strippedPath === p || strippedPath.startsWith(`${p}/`),
  );
}

/**
 * Anonymous visitors to public pages can skip the `auth.getUser()` round-trip
 * entirely — saves ~150-300ms TTFB. We detect anon by the absence of any
 * Supabase auth cookie (sb-<project>-auth-token). If any sb-* cookie exists,
 * we must refresh the session to keep logged-in users logged in.
 */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
      return true;
    }
  }
  return false;
}

// Metadata routes (og image / twitter / icons / sitemap) must pass through
// locale rewriting, but skip auth and session work — crawlers have no cookies.
function isMetadataRoute(pathname: string): boolean {
  return (
    pathname.endsWith("/opengraph-image") ||
    pathname.endsWith("/twitter-image") ||
    pathname.endsWith("/icon") ||
    pathname.endsWith("/apple-icon") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root-level files: skip everything (no intl, no auth)
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    pathname === "/auth/callback"
  ) {
    return NextResponse.next();
  }

  // OAuth code exchange: if ?code= param present, redirect to callback handler
  const code = request.nextUrl.searchParams.get("code");
  if (code && pathname !== "/auth/callback") {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    callbackUrl.searchParams.set("code", code);
    return NextResponse.redirect(callbackUrl);
  }

  // Metadata routes: only intl rewrite, no auth/session
  if (isMetadataRoute(pathname)) {
    return intlMiddleware(request);
  }

  // Fast path: anon visitor on a public path → skip Supabase session refresh
  // entirely. No cookies to refresh, no user to check. Saves ~150-300ms TTFB
  // on the highest-traffic pages (/, /jobs, /companies).
  const isPublic = isPublicPath(request.nextUrl.pathname);
  const hasAuthCookie = hasSupabaseAuthCookie(request);
  if (isPublic && !hasAuthCookie) {
    return intlMiddleware(request);
  }

  // Step 1: Refresh Supabase session (reads/writes auth cookies)
  const { user, supabaseResponse } = await updateSession(request);

  // Step 2: Check auth for protected routes
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Step 3: Handle locale routing (rewrites /jobs → /ka/jobs, etc.)
  const intlResponse = intlMiddleware(request);

  // Step 4: Merge ALL Supabase session cookies into the intl response
  // This is critical — without this, locale switching drops the auth session
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
