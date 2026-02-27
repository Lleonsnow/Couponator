import { PrismaClient, Role, TransactionStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123";

const CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Красноярск",
  "Челябинск",
  "Самара",
  "Уфа",
  "Ростов-на-Дону",
  "Краснодар",
  "Омск",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Барнаул",
  "Ижевск",
  "Махачкала",
  "Хабаровск",
  "Ульяновск",
  "Иркутск",
  "Владивосток",
  "Ярославль",
  "Кемерово",
  "Томск",
  "Набережные Челны",
  "Севастополь",
  "Ставрополь",
  "Оренбург",
  "Новокузнецк",
  "Рязань",
  "Балашиха",
  "Пенза",
  "Чебоксары",
  "Липецк",
  "Калининград",
  "Астрахань",
  "Тула",
  "Киров",
  "Сочи",
];

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
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

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

  const entCat = catBySlug["entertainment"];
  if (!entCat) throw new Error("Category entertainment not found");

  log("очистка купонов и транзакций...");
  await prisma.transaction.deleteMany({});
  await prisma.coupon.deleteMany({});

  const DEFAULT_DISCOUNT = 10;
  log("купоны (1/45)...");
  const price1 = 975;
  await prisma.coupon.create({
    data: {
      merchantId: merchants[0].id,
      title: "Купон на стрельбу из лука, арбалета и пневматики",
      categoryId: entCat.id,
      imageUrl: "/seed/coupon-bow.jpg",
      price: price1,
      oldPrice: Math.round(price1 / (1 - DEFAULT_DISCOUNT / 100)),
      discountPercent: DEFAULT_DISCOUNT,
      city: "Москва",
      noGeo: false,
      conditionsHtml:
        "<p><strong>Вы можете предъявить купон в электронном или распечатанном виде.</strong><br>Купон действует в любой день в любое время работы центра.</p>",
      descriptionHtml:
        "<p>Отличная возможность снять стресс и научиться обращаться с оружием.</p>",
      addressHtml: "<p>г. Москва, ул. Спортивная, д. 15</p>",
    },
  });

  for (let i = 2; i <= 45; i++) {
    if (i % 10 === 0) log(`  купоны (${i}/45)...`);
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const merchant = merchants[(i - 2) % merchants.length];
    const cityIdx = Math.floor(Math.random() * 5);
    const noGeo = Math.random() > 0.8;
    const city = noGeo ? null : CITIES[cityIdx];
    const price = Math.floor(Math.random() * 300) * 10 + 500;
    const c = await prisma.coupon.create({
      data: {
        merchantId: merchant.id,
        title: `Скидка на услуги: ${cat.name} (Купон #${i})`,
        categoryId: cat.id,
        imageUrl: `/seed/coupon-${i * 12}.jpg`,
        price,
        oldPrice: Math.round(price / (1 - DEFAULT_DISCOUNT / 100)),
        discountPercent: DEFAULT_DISCOUNT,
        city,
        noGeo,
        conditionsHtml: "<p>Стандартные условия предоставления услуги.</p>",
        descriptionHtml: "<p>Описание услуги от партнера.</p>",
        addressHtml: `<p>Город: ${noGeo ? "Любой" : city}</p>`,
      },
    });
  }

  log("транзакции (4)...");
  const couponBow = await prisma.coupon.findFirst({
    where: { title: { contains: "стрельбу" }, merchantId: merchants[0].id },
  });
  const couponM2 = await prisma.coupon.findFirst({ where: { merchantId: merchants[1].id } });
  const couponM3 = await prisma.coupon.findFirst({ where: { merchantId: merchants[2].id } });
  if (!couponBow || !couponM2 || !couponM3) throw new Error("Coupons for transactions not found");

  const txSpecs = [
    { userId: buyerUser.id, couponId: couponBow.id, amount: 975, status: TransactionStatus.PAID, createdAt: new Date("2026-02-20T14:30:00") },
    { userId: extraBuyers[0].id, couponId: couponM2.id, amount: 1950, status: TransactionStatus.PENDING, createdAt: new Date("2026-02-19T18:15:00") },
    { userId: extraBuyers[1].id, couponId: couponBow.id, amount: 975, status: TransactionStatus.PAID, createdAt: new Date("2026-02-18T10:05:00") },
    { userId: extraBuyers[2].id, couponId: couponM3.id, amount: 3800, status: TransactionStatus.PAID, createdAt: new Date("2026-02-15T09:20:00") },
  ];
  for (const tx of txSpecs) {
    await prisma.transaction.create({
      data: { ...tx, currency: "RUB" },
    });
  }

  log("промокоды (7)...");
  await prisma.promoCode.deleteMany({});
  const PROMO_CODES = [
    { store: "Алёнка", title: "Скидка 50% по промокоду + подарки", code: "ФЕВРАЛЬ", discount: "50%", desc: "Батончики РотФронт при заказе от 999 р.", logo: "/seed/promo-alenka.png", link: "https://dhwnh.com/g/wu9btps6pk98f8b05a7b45305aaa81/?i=3" },
    { store: "ECCO", title: "Скидка 500 рублей на все", code: "ECCOADMITAD500", discount: "500 ₽", desc: "Не применяется к акционным товарам", logo: "/seed/promo-ecco.png", link: "https://kdbov.com/g/thm6cegqfc98f8b05a7b2cb26b7aaa/?i=3" },
    { store: "Playtoday", title: "Скидка 10% на все!", code: "TOGETHER10", discount: "10%", desc: "Скидка на детскую одежду", logo: "/seed/promo-playtoday.svg", link: "https://rcpsj.com/g/o816muoptj98f8b05a7b78ec4c4caa/?i=3" },
    { store: "xcom-shop", title: "Скидка 3% на заказ", code: "Admitad_02", discount: "3%", desc: "Скидка на электронику и инструменты", logo: "/seed/promo-xcom-shop.png", link: "https://bywiola.com/g/5icdsgkpe798f8b05a7b67a4d63e81/?i=3" },
    { store: "COZY HOME", title: "Скидка 30% от 5000", code: "admitad30", discount: "30%", desc: "Действует только онлайн", logo: "/seed/promo-cozy-home.jpg", link: "https://ficca2021.com/g/k7pgzv4jt698f8b05a7b74bec426fb/?i=3" },
    { store: "belle you", title: "Скидка 6% при заказе от 5500р", code: "admitad6", discount: "6%", desc: "Действует онлайн для всех клиентов", logo: "/seed/promo-belle-you.svg", link: "https://thevospad.com/g/jdwj1fvgbt98f8b05a7b9db36b8b43/?i=3" },
    { store: "YVES ROCHER", title: "Скидка 25% от 4000 руб", code: "АMMA-B4L", discount: "25%", desc: "Уходовая косметика и парфюмерия", logo: "/seed/promo-yves-rocher.svg", link: "https://cafxq.com/g/2sfsmfuy1a98f8b05a7bc188ef9305/?i=3" },
  ];
  await prisma.promoCode.createMany({ data: PROMO_CODES });

  log("готово.");
  log("---");
  log("логины (пароль: " + DEMO_PASSWORD + "):");
  log("  super@admin.ru — админ");
  log("  admin@admin.ru, merchant2@demo.ru, merchant3@demo.ru — мерчанты");
  log("  user@mail.ru, guest12@mail.ru, test@yandex.ru, roman@gmail.com — покупатели");
  log("---");
  log("создано: категорий " + CATEGORIES.length + ", мерчантов " + merchants.length + ", купонов 45, транзакций 4, промокодов 7");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
