import { PrismaClient, Role } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { XMLParser } from "fast-xml-parser";

const prisma = new PrismaClient();

function text(el: unknown): string {
  if (el == null) return "";
  if (typeof el === "string") return String(el).trim();
  if (typeof el === "object" && el !== null && "#text" in el) return String((el as { "#text"?: string })["#text"] ?? "").trim();
  return "";
}

function one<T>(x: T | T[]): T {
  return Array.isArray(x) ? x[0]! : x;
}

function all<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x];
}

async function fetchAdmitadPromocodes(feedUrl: string): Promise<{ store: string; title: string; code: string; discount: string; desc: string; logo: string; link: string }[]> {
  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Admitad feed failed: ${res.status} ${res.statusText}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const root = parser.parse(xml)?.admitad_coupons;
  if (!root) return [];

  const campaigns = all((root.advcampaigns as { advcampaign?: unknown })?.advcampaign ?? []) as Record<string, unknown>[];
  const campaignNames: Record<string, string> = {};
  for (const c of campaigns) {
    const id = c["@_id"] ?? c.id;
    if (id != null) campaignNames[String(id)] = text(c.name) || text(c["#text"]) || "—";
  }

  const coupons = all(one(root.coupons)?.coupon ?? []) as Record<string, unknown>[];
  const rows: { store: string; title: string; code: string; discount: string; desc: string; logo: string; link: string }[] = [];
  for (const c of coupons) {
    const campaignId = String(c.advcampaign_id ?? c["@_id"] ?? "");
    const store = campaignNames[campaignId] || "—";
    const name = text(c.name);
    const codeRaw = text(c.promocode);
    const code = !codeRaw || /not required/i.test(codeRaw) ? "—" : codeRaw;
    const discount = text(c.discount) || "";
    const desc = text(c.description) || "";
    const logo = text(c.logo) || "";
    const link = text(c.promolink) || text(c.gotolink) || "";
    if (!name || !link) continue;
    rows.push({ store, title: name, code, discount, desc, logo, link });
  }
  return rows;
}
const DEMO_PASSWORD = "demo123";

const CATEGORIES = [
  { slug: "entertainment", name: "Развлечения" },
  { slug: "hotels", name: "Отели" },
  { slug: "beauty", name: "Красота" },
  { slug: "auto", name: "Авто" },
  { slug: "food", name: "Рестораны" },
  { slug: "health", name: "Здоровье" },
  { slug: "education", name: "Обучение" },
  { slug: "sport", name: "Фитнес" },
  { slug: "shops", name: "Товары" },
  { slug: "kids", name: "Детям" },
  { slug: "tours", name: "Экскурсии" },
  { slug: "events", name: "События" },
  { slug: "photo", name: "Фотосессии" },
  { slug: "cleaning", name: "Клининг" },
  { slug: "delivery", name: "Доставка" },
];

const MERCHANT_SPECS = [
  { name: "Стрелковый клуб «Цель»", slug: "strelkovyj-klub-cel", email: "admin@admin.ru" },
  { name: "Ресторан «Вкусная Точка»", slug: "restoran-vkusnaya-tochka", email: "merchant2@demo.ru" },
  { name: "Автосервис «Колесо»", slug: "avtoservis-koleso", email: "merchant3@demo.ru" },
];

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

async function main() {
  log("старт");

  log("пользователи...");
  await prisma.user.upsert({
    where: { email: "super@admin.ru" },
    update: {},
    create: {
      email: "super@admin.ru",
      passwordHash: hashSync(DEMO_PASSWORD, 10),
      role: Role.ADMIN,
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: "user@mail.ru" },
    update: {},
    create: {
      email: "user@mail.ru",
      passwordHash: hashSync(DEMO_PASSWORD, 10),
      role: Role.USER,
    },
  });

  const extraBuyerEmails = ["guest12@mail.ru", "test@yandex.ru", "roman@gmail.com"];
  const extraBuyers: { id: string }[] = [];
  for (const email of extraBuyerEmails) {
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashSync(DEMO_PASSWORD, 10),
        role: Role.USER,
      },
    });
    extraBuyers.push(u);
  }

  const merchantUsers: { id: string }[] = [];
  for (const m of MERCHANT_SPECS) {
    const u = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        passwordHash: hashSync(DEMO_PASSWORD, 10),
        role: Role.MERCHANT,
      },
    });
    merchantUsers.push(u);
  }
  log(`  пользователи: admin + buyer + ${merchantUsers.length} мерчантов`);

  log("категории...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const categories = await prisma.category.findMany();
  log(`  категорий: ${categories.length}`);

  log("мерчанты...");
  const merchants: { id: string }[] = [];
  for (let i = 0; i < MERCHANT_SPECS.length; i++) {
    const m = MERCHANT_SPECS[i];
    const u = merchantUsers[i];
    const merchant = await prisma.merchant.upsert({
      where: { slug: m.slug },
      update: {},
      create: {
        name: m.name,
        slug: m.slug,
        ownerUserId: u.id,
      },
    });
    merchants.push(merchant);
  }
  log(`  мерчантов: ${merchants.length}`);

  log("очистка купонов и транзакций...");
  await prisma.transaction.deleteMany({});
  await prisma.coupon.deleteMany({});

  const feedUrl = process.env.ADMITAD_FEED_URL;
  await prisma.promoCode.deleteMany({});

  if (feedUrl) {
    log("промокоды из ADMITAD_FEED_URL...");
    try {
      const rows = await fetchAdmitadPromocodes(feedUrl);
      const chunk = 100;
      for (let i = 0; i < rows.length; i += chunk) {
        await prisma.promoCode.createMany({ data: rows.slice(i, i + chunk) });
      }
      log(`  загружено промокодов: ${rows.length}`);
    } catch (e) {
      console.error("[seed] Admitad feed error:", e);
      log("  промокоды не загружены (ошибка фида)");
    }
  } else {
    log("промокоды пропущены (ADMITAD_FEED_URL не задан)");
  }

  log("готово.");
  log("---");
  log("логины (пароль: " + DEMO_PASSWORD + "):");
  log("  super@admin.ru — админ");
  log("  admin@admin.ru, merchant2@demo.ru, merchant3@demo.ru — мерчанты");
  log("  user@mail.ru, guest12@mail.ru, test@yandex.ru, roman@gmail.com — покупатели");
  log("---");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
