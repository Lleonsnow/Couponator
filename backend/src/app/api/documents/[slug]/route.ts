import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const DOCX_SLUGS = ["user-agreement", "privacy", "offer"] as const;

const STYLE_MAP = [
  "p[style-name='Heading 1'] => h2:fresh",
  "p[style-name='Heading 2'] => h3:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "p[style-name='Normal'] => p:fresh",
].join("\n");

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  if (!DOCX_SLUGS.includes(slug as (typeof DOCX_SLUGS)[number])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await prisma.documentFile.findUnique({
    where: { slug },
  });

  if (!doc || doc.ext !== "docx") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buffer = Buffer.from(doc.data);
    const { value } = await mammoth.convertToHtml({ buffer }, { styleMap: STYLE_MAP });

    let html = value ?? "";
    html = html.replace(/<p>(\s*§[^<]*)<\/p>/g, "<h2>$1</h2>");
    html = html.replace(/<p>(\s*&sect;[^<]*)<\/p>/g, "<h2>$1</h2>");

    return NextResponse.json({ html });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}

