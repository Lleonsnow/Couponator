import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const doc = await prisma.documentFile.findUnique({
    where: { slug },
  });

  if (!doc || doc.ext !== "pdf") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = Buffer.from(doc.data);

  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 404 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mime || "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}

