import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session || session.role !== "MERCHANT" || !session.merchantId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.coupon.findMany({
    where: { merchantId: session.merchantId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}
