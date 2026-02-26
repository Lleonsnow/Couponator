import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TransactionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const MIN_CERT_AMOUNT = 100;
const MAX_CERT_AMOUNT = 100_000;

const bodySchema = z.object({
  couponId: z.string().cuid().optional(),
  certificateId: z.string().cuid().optional(),
  amount: z.number().int().min(1).max(10_000_000),
}).refine((d) => (d.couponId != null) !== (d.certificateId != null), { message: "Either couponId or certificateId" });

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
  const { couponId, certificateId, amount } = parsed.data;

  if (certificateId) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId, isActive: true },
    });
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    if (amount < MIN_CERT_AMOUNT)
      return NextResponse.json({ error: "Amount below minimum" }, { status: 400 });
    if (amount > MAX_CERT_AMOUNT)
      return NextResponse.json({ error: "Amount above maximum" }, { status: 400 });
    const tx = await prisma.transaction.create({
      data: {
        userId: session.sub,
        certificateId: cert.id,
        amount,
        status: TransactionStatus.PAID,
        currency: "RUB",
      },
    });
    return NextResponse.json({ id: tx.id });
  }

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId!, isActive: true },
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
