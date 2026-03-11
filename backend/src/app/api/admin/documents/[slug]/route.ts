import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

const DOCX_SLUGS = ["user-agreement", "privacy", "offer"] as const;
const PDF_SLUGS = ["org-card"] as const;

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  let ext: "docx" | "pdf" | null = null;
  if (DOCX_SLUGS.includes(slug as (typeof DOCX_SLUGS)[number])) {
    ext = "docx";
  } else if (PDF_SLUGS.includes(slug as (typeof PDF_SLUGS)[number])) {
    ext = "pdf";
  } else {
    return NextResponse.json({ error: "Unknown document slug" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  const mimeFromFile = (file as File).type || (ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  await prisma.documentFile.upsert({
    where: { slug },
    update: { data: buffer, ext, mime: mimeFromFile },
    create: { slug, data: buffer, ext, mime: mimeFromFile },
  });

  return NextResponse.json({ ok: true });
}

