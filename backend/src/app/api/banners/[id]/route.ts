import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  slot: z.enum(["TOP", "SIDE"]).optional(),
  html: z.string().max(10000).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN]))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const raw = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.banner.update({
    where: { id },
    data: {
      ...(parsed.data.slot && { slot: parsed.data.slot }),
      ...(parsed.data.html !== undefined && { html: parsed.data.html }),
      ...(parsed.data.order !== undefined && { order: parsed.data.order }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN]))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.banner.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
