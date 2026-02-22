import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN]))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [merchantsCount, couponsCount, agg] = await Promise.all([
    prisma.merchant.count(),
    prisma.coupon.count(),
    prisma.transaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    merchants: merchantsCount,
    coupons: couponsCount,
    turnover: Number(agg._sum.amount ?? 0),
  });
}
