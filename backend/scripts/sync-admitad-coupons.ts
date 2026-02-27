import { readFileSync, existsSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function text(el: unknown): string {
  if (el == null) return "";
  if (typeof el === "string") return el.trim();
  if (typeof el === "object" && el !== null && "#text" in el) return String((el as { "#text"?: string })["#text"] ?? "").trim();
  return "";
}

function one<T>(x: T | T[]): T {
  return Array.isArray(x) ? x[0]! : x;
}

function all<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x];
}

async function getXml(): Promise<string> {
  const arg = process.argv[2] || process.env.ADMITAD_FEED_PATH;
  const url = process.env.ADMITAD_FEED_URL;
  if (arg && !arg.startsWith("http") && existsSync(arg)) {
    return readFileSync(arg, "utf-8");
  }
  const feedUrl = arg?.startsWith("http") ? arg : url;
  if (!feedUrl) {
    console.error("Set ADMITAD_FEED_URL in .env or pass URL as argument");
    process.exit(1);
  }
  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  return res.text();
}

async function main() {
  const xml = await getXml();
  const parser = new XMLParser({ ignoreAttributes: false });
  const root = parser.parse(xml)?.admitad_coupons;
  if (!root) {
    console.error("Invalid admitad_coupons XML");
    process.exit(1);
  }

  const campaigns = all((root.advcampaigns as { advcampaign?: unknown })?.advcampaign ?? []) as Record<string, unknown>[];
  const campaignNames: Record<string, string> = {};
  for (const c of campaigns) {
    const id = c["@_id"] ?? c.id;
    if (id != null) campaignNames[String(id)] = text(c.name) || text(c["#text"]) || "—";
  }

  const coupons = all(one(root.coupons)?.coupon ?? []) as Record<string, unknown>[];
  const rows: { store: string; title: string; code: string; discount: string; desc: string; logo: string; link: string }[] = [];

  for (const c of coupons) {
    const raw = c;
    const campaignId = String(raw.advcampaign_id ?? raw["@_id"] ?? "");
    const store = campaignNames[campaignId] || "—";
    const name = text(raw.name);
    const codeRaw = text(raw.promocode);
    const code = !codeRaw || /not required/i.test(codeRaw) ? "—" : codeRaw;
    const discount = text(raw.discount) || "";
    const desc = text(raw.description) || "";
    const logo = text(raw.logo) || "";
    const link = text(raw.promolink) || text(raw.gotolink) || "";
    if (!name || !link) continue;
    rows.push({ store, title: name, code, discount, desc, logo, link });
  }

  await prisma.promoCode.deleteMany({});
  const chunk = 100;
  for (let i = 0; i < rows.length; i += chunk) {
    await prisma.promoCode.createMany({ data: rows.slice(i, i + chunk) });
  }
  console.log("Promocodes synced:", rows.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
