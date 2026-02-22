import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function corsHeaders(req: NextRequest) {
  const h = new Headers();
  const origin = req.headers.get("origin");
  if (origin && (origin.startsWith("http://localhost") || origin.startsWith("https://")))
    h.set("Access-Control-Allow-Origin", origin);
  h.set("Access-Control-Allow-Credentials", "true");
  h.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  return h;
}

export function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  const res = NextResponse.next();
  corsHeaders(req).forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = { matcher: "/api/:path*" };
