import { NextResponse } from "next/server";
import { Role, BannerSlot } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  slot: z.enum(["TOP", "SIDE"]),
  html: z.string().max(10000),
  order: z.number().int().min(0).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slot = searchParams.get("slot");
  const where = slot === "TOP" || slot === "SIDE" ? { slot: slot as BannerSlot } : {};
  const list = await prisma.banner.findMany({
    where,
    orderBy: { order: "asc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN]))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const banner = await prisma.banner.create({
    data: {
      slot: parsed.data.slot,
      html: parsed.data.html,
      order: parsed.data.order ?? 0,
    },
  });
  return NextResponse.json(banner);
}
