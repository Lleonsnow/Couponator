import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  let cert = await prisma.certificate.findFirst({
    where: { merchantId: id, isActive: true },
  });
  if (!cert) {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });
    if (!merchant)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    cert = await prisma.certificate.create({
      data: { merchantId: id, title: "Подарочный сертификат" },
    });
  }
  return NextResponse.json(cert);
}

