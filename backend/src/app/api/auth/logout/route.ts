import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";
  const parts = ["token=; Path=/; Max-Age=0", "SameSite=Lax", "HttpOnly", ...(isProd ? ["Secure"] : [])];
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", parts.join("; "));
  return res;
}
