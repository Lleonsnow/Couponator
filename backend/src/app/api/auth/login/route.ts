import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const rate = checkLoginRateLimit(req);
  if (!rate.ok)
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { merchant: true },
  });
  if (!user || !compareSync(parsed.data.password, user.passwordHash))
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    merchantId: user.merchant?.id ?? null,
  });
  const isProd = process.env.NODE_ENV === "production";
  const cookieParts = [
    `token=${token}`,
    "Path=/",
    "Max-Age=604800",
    "SameSite=Lax",
    "HttpOnly",
    ...(isProd ? ["Secure"] : []),
  ];
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role, merchantId: user.merchant?.id ?? null },
  });
  res.headers.set("Set-Cookie", cookieParts.join("; "));
  return res;
}
