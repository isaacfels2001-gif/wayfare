import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic-only gate: just checks whether an Auth.js session cookie is
// present, so obviously-logged-out visitors bounce to /login without a full
// render. This is NOT the real authorization boundary — every /account and
// /admin page/action re-verifies the session and role itself (see
// src/lib/session.ts) because proxy matchers can miss Server Action POSTs.
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export default function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
