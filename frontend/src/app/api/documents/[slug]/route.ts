import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { readFile } from "fs/promises";
import { join } from "path";

const DOCX_SLUGS = ["user-agreement", "privacy", "offer"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!DOCX_SLUGS.includes(slug as (typeof DOCX_SLUGS)[number])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const path = join(process.cwd(), "public", "documents", `${slug}.docx`);
    const buffer = await readFile(path);
    const { value } = await mammoth.convertToHtml({ buffer });
    return NextResponse.json({ html: value });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}
