import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

// Public paths that don't require authentication (without locale prefix)
const PUBLIC_PATHS = ["/", "/jobs", "/companies", "/auth", "/pricing", "/salaries", "/seekers", "/about"];

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix if present (e.g., /en/jobs → /jobs)
  const strippedPath = pathname.replace(/^\/(ka|en)/, "") || "/";
  return PUBLIC_PATHS.some(
    (p) => strippedPath === p || strippedPath.startsWith(`${p}/`),
  );
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
  // Metadata routes: only intl rewrite, no auth/session
  if (isMetadataRoute(request.nextUrl.pathname)) {
    return intlMiddleware(request);
  }

  // Step 1: Refresh Supabase session (reads/writes auth cookies)
  const { user, supabaseResponse } = await updateSession(request);

  // Step 2: Check auth for protected routes
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
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
