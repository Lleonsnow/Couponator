import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const PDF_SLUGS = ["org-card"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!PDF_SLUGS.includes(slug as (typeof PDF_SLUGS)[number])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const path = join(process.cwd(), "public", "documents", `${slug}.pdf`);
    const buffer = await readFile(path);
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 404 });
    }
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
