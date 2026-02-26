import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/me", "/admin", "/merchant"];

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];
const securityHeaders = new Headers([["Content-Security-Policy", csp.join("; ")]]);

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
  if (isProtected && !token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("from", path);
    const redirect = NextResponse.redirect(login);
    securityHeaders.forEach((v, k) => redirect.headers.set(k, v));
    return redirect;
  }
  const res = NextResponse.next();
  securityHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = { matcher: ["/me/:path*", "/admin/:path*", "/merchant/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"] };
