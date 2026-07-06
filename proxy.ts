import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_AUTHENTICATED_PATH,
  GUEST_ONLY_PATHS,
  matchesPath,
  PUBLIC_PATHS,
} from "@/auth/config";

// Coarse gating only: this checks the access-token cookie's *presence*, not
// its validity — the JWT is verified for real by the backend on every request.
// This just avoids flashing protected pages before that check happens.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const isPublicPath = matchesPath(PUBLIC_PATHS, pathname);
  const isGuestOnlyPath = matchesPath(GUEST_ONLY_PATHS, pathname);

  if (!hasToken && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasToken && isGuestOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Forwarded so server layouts (e.g. (dashboard)/layout.tsx) can tell which
  // path they're rendering for and opt individual pages out of their own
  // auth gate — Server Components have no other way to read the pathname.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
