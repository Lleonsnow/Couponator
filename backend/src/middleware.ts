import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function corsHeaders(req: NextRequest) {
  const h = new Headers();
  const origin = req.headers.get("origin");
  const allowed = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean);
  const allowOrigin =
    origin &&
    (allowed?.length
      ? allowed.some((a) => origin === a || (a.endsWith("*") && origin.startsWith(a.slice(0, -1))))
      : origin.startsWith("http://localhost") || origin.startsWith("https://"));
  if (allowOrigin) h.set("Access-Control-Allow-Origin", origin);
  h.set("Access-Control-Allow-Credentials", "true");
  h.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  return h;
}

const securityHeaders = new Headers([
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
]);
if (process.env.NODE_ENV === "production")
  securityHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

export function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  const res = NextResponse.next();
  corsHeaders(req).forEach((v, k) => res.headers.set(k, v));
  securityHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = { matcher: "/api/:path*" };
