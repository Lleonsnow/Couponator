import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TransactionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  couponId: z.string().cuid(),
  amount: z.number().int().min(1).max(10_000_000),
});

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { couponId, amount } = parsed.data;

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
