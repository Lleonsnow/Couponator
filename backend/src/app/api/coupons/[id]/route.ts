import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  merchantId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  title: z.string().min(1).max(500).optional(),
  price: z.number().int().min(0).optional(),
  noGeo: z.boolean().optional(),
  city: z.string().max(100).nullable().optional(),
  conditionsHtml: z.string().optional(),
  descriptionHtml: z.string().optional(),
  addressHtml: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { category: true, merchant: true },
  });
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession(req);
  const isAdmin = requireRole(session, [Role.ADMIN]);
  const isMerchant = requireRole(session, [Role.MERCHANT]) && session?.merchantId;
  if (!isAdmin && !isMerchant)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { merchant: true },
  });
  if (!coupon)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin && coupon.merchantId !== session!.merchantId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data = parsed.data;
  let merchantId = coupon.merchantId;
  if (isAdmin && data.merchantId) {
    const m = await prisma.merchant.findUnique({ where: { id: data.merchantId } });
    if (!m) return NextResponse.json({ error: "Merchant not found" }, { status: 400 });
    merchantId = data.merchantId;
  }
  if (data.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const updateData = {
    ...(data.merchantId !== undefined && isAdmin && { merchantId: data.merchantId }),
    ...(data.categoryId && { categoryId: data.categoryId }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.noGeo !== undefined && {
      noGeo: data.noGeo,
      city: data.noGeo ? null : (data.city ?? null),
    }),
    ...(data.noGeo === undefined && data.city !== undefined && { city: data.city }),
    ...(data.conditionsHtml !== undefined && { conditionsHtml: data.conditionsHtml }),
    ...(data.descriptionHtml !== undefined && { descriptionHtml: data.descriptionHtml }),
    ...(data.addressHtml !== undefined && { addressHtml: data.addressHtml }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
  };

  const updated = await prisma.coupon.update({
    where: { id },
    data: updateData,
    include: { category: true, merchant: true },
  });
  return NextResponse.json(updated);
}
