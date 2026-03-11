import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN]))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { id },
    select: { ownerUserId: true },
  });
  if (!merchant)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({
    where: { id: merchant.ownerUserId },
  });

  return NextResponse.json({ ok: true });
}

