import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, DEFAULT_AUTHENTICATED_PATH, PUBLIC_PATHS } from "@/auth/config";

// Coarse gating only: this checks the access-token cookie's *presence*, not
// its validity — the JWT is verified for real by the backend on every request.
// This just avoids flashing protected pages before that check happens.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!hasToken && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasToken && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHENTICATED_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
