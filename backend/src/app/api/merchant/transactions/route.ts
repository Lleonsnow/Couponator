import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session || session.role !== "MERCHANT" || !session.merchantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.transaction.findMany({
    where: {
      OR: [
        { coupon: { merchantId: session.merchantId } },
        { certificate: { merchantId: session.merchantId } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true } },
      coupon: { select: { title: true } },
      certificate: { select: { title: true } },
    },
  });
  return NextResponse.json(list);
}
