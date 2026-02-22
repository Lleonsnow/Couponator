import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TransactionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { couponId?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { couponId, amount } = body;
  if (!couponId || typeof amount !== "number" || amount < 1)
    return NextResponse.json({ error: "couponId and amount required" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId, isActive: true },
  });
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  if (amount < coupon.price)
    return NextResponse.json({ error: "Amount below minimum" }, { status: 400 });

  const tx = await prisma.transaction.create({
    data: {
      userId: session.sub,
      couponId: coupon.id,
      amount,
      status: TransactionStatus.PAID,
      currency: "RUB",
    },
  });
  return NextResponse.json({ id: tx.id });
}
