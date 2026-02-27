import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  merchantId: z.string().cuid().optional(),
  categoryId: z.string().cuid(),
  title: z.string().min(1).max(500),
  price: z.number().int().min(0).optional(),
  oldPrice: z.number().int().min(0).nullable().optional(),
  discountPercent: z.number().int().min(0).max(99).nullable().optional(),
  noGeo: z.boolean(),
  city: z.string().max(100).nullable().optional(),
  conditionsHtml: z.string().optional(),
  descriptionHtml: z.string().optional(),
  addressHtml: z.string().optional(),
  imageUrl: z.string().max(2000).nullable().optional(),
});

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    include: { category: true, merchant: true },
    take: 100,
  });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await getSession(req);
  const isAdmin = requireRole(session, [Role.ADMIN]);
  const isMerchant = requireRole(session, [Role.MERCHANT]) && session?.merchantId;
  if (!isAdmin && !isMerchant)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const merchantId = isAdmin && parsed.data.merchantId
    ? parsed.data.merchantId
    : isMerchant
      ? session!.merchantId!
      : null;
  if (!merchantId)
    return NextResponse.json({ error: "Merchant required" }, { status: 400 });

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant)
    return NextResponse.json({ error: "Merchant not found" }, { status: 400 });
  if (!isAdmin && merchant.ownerUserId !== session!.sub)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category)
    return NextResponse.json({ error: "Category not found" }, { status: 400 });

  let price: number;
  if (parsed.data.oldPrice != null && parsed.data.discountPercent != null) {
    price = Math.round(parsed.data.oldPrice * (1 - parsed.data.discountPercent / 100));
  } else if (parsed.data.price != null) {
    price = parsed.data.price;
  } else {
    return NextResponse.json({ error: "Укажите цену или oldPrice и скидку %" }, { status: 400 });
  }
  if (price < 0)
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      merchantId,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      price,
      oldPrice: parsed.data.oldPrice ?? null,
      discountPercent: parsed.data.discountPercent ?? null,
      noGeo: parsed.data.noGeo,
      city: parsed.data.noGeo ? null : (parsed.data.city ?? null),
      conditionsHtml: parsed.data.conditionsHtml ?? "",
      descriptionHtml: parsed.data.descriptionHtml ?? "",
      addressHtml: parsed.data.addressHtml ?? "",
      imageUrl: parsed.data.imageUrl ?? null,
    },
    include: { category: true, merchant: true },
  });
  return NextResponse.json(coupon);
}
