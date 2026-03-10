import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const doc = await prisma.documentFile.findUnique({
    where: { slug },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = Buffer.from(doc.data);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `attachment; filename="${slug}.${doc.ext}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}

