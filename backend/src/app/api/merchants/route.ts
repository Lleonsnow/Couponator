import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => CYRILLIC_TO_LATIN[c] ?? (c >= "а" && c <= "я" ? "" : c))
    .join("");
}

function slugify(name: string): string {
  const transliterated = transliterate(name);
  return transliterated
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    || "merchant";
}

const postSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function GET() {
  const merchants = await prisma.merchant.findMany({ take: 100 });
  return NextResponse.json(merchants);
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!requireRole(session, [Role.ADMIN]))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, email, password, slug: rawSlug } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });

  const baseSlug = (rawSlug && rawSlug.trim()) ? slugify(rawSlug.trim()) : slugify(name);
  let slug = baseSlug || "merchant";
  let n = 0;
  while (await prisma.merchant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashSync(password, 10),
      role: Role.MERCHANT,
      merchant: {
        create: { name, slug },
      },
    },
    include: { merchant: true },
  });

  return NextResponse.json({
    id: user.merchant!.id,
    name,
    slug,
    ownerUserId: user.id,
  });
}
