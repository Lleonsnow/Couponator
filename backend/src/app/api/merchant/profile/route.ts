import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
});

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.merchantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: { id: true, name: true, slug: true },
  });
  if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(merchant);
}

export async function PATCH(req: Request) {
  const session = await getSession(req);
  if (!session?.merchantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data = parsed.data;
  if (data.slug) {
    const existing = await prisma.merchant.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== session.merchantId)
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
  }

  const updated = await prisma.merchant.update({
    where: { id: session.merchantId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
    },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json(updated);
}
