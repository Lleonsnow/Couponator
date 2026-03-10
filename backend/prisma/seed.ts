import { PrismaClient, Role } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123";

const MERCHANT_EMAILS = ["admin@admin.ru", "merchant2@demo.ru", "merchant3@demo.ru"];

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

  for (const email of MERCHANT_EMAILS) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashSync(DEMO_PASSWORD, 10),
        role: Role.MERCHANT,
      },
    });
  }

  log("категории...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  log("сид: созданы пользователи и справочник категорий.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
