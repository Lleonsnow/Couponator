import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tx = await prisma.transaction.findFirst({
    where: { id, userId: session.sub },
    include: {
      coupon: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          price: true,
          merchant: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
      certificate: {
        select: {
          id: true,
          title: true,
          merchant: { select: { name: true } },
        },
      },
      user: { select: { email: true } },
    },
  });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tx);
}
