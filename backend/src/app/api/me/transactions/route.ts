import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.transaction.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      coupon: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          price: true,
          category: { select: { name: true } },
        },
      },
    },
  });
  return NextResponse.json(list);
}
