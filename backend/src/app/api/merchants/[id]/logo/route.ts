import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const logo = await prisma.merchantLogo.findUnique({
    where: { merchantId: id },
  });
  if (!logo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const buffer = Buffer.from(logo.data);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": logo.mime,
      "Cache-Control": "public, max-age=86400",
      "Content-Length": String(buffer.length),
    },
  });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession(req);
  const { id } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { id },
    select: { id: true, ownerUserId: true },
  });
  if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = requireRole(session, [Role.ADMIN]);
  const isOwner = session?.merchantId === id;
  if (!isAdmin && !isOwner)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob) || file.size === 0)
    return NextResponse.json({ error: "File required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let mime = (file as File).type || "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8) mime = "image/jpeg";
    else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e) mime = "image/png";
    else if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") mime = "image/webp";
    else return NextResponse.json({ error: "Only JPEG, PNG, WebP" }, { status: 400 });
  }
  if (buffer.length > 2 * 1024 * 1024)
    return NextResponse.json({ error: "Max 2 MB" }, { status: 400 });

  await prisma.merchantLogo.upsert({
    where: { merchantId: id },
    update: { data: buffer, mime },
    create: { merchantId: id, data: buffer, mime },
  });
  return NextResponse.json({ ok: true });
}
