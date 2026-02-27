import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../../frontend/public/seed");

const COUPON_URLS = [
  { url: "https://picsum.photos/seed/bow/600/338", file: "coupon-bow.jpg" },
  ...Array.from({ length: 44 }, (_, i) => ({
    url: `https://picsum.photos/seed/${(i + 2) * 12}/600/338`,
    file: `coupon-${(i + 2) * 12}.jpg`,
  })),
];

const PROMO_URLS = [
  { url: "https://cdn.admitad.com/campaign/images/2020/10/21/17345-e9f9e2c11f2b8bac.png", file: "promo-alenka.png" },
  { url: "https://cdn.admitad.com/campaign/images/2020/10/14/13979-0403d3332204d59a.png", file: "promo-ecco.png" },
  { url: "https://cdn.admitad.com/campaign/images/2021/4/5/17006-bf41cdea126535be.svg", file: "promo-playtoday.svg" },
  { url: "https://cdn.admitad.com/campaign/images/2020/10/12/14442-61f998e4c2852cdf.png", file: "promo-xcom-shop.png" },
  { url: "https://cdn.admitad.com/campaign/images/2022/7/11/26239-9ee15859e5e68126.jpg", file: "promo-cozy-home.jpg" },
  { url: "https://cdn.admitad.com/campaign/images/2026/2/18/23407-9d91029d4d01340f.svg", file: "promo-belle-you.svg" },
  { url: "https://cdn.admitad.com/campaign/images/2023/3/13/1667-50e340ecac199ec3.svg", file: "promo-yves-rocher.svg" },
];

async function download(url, filePath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buf);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const { url, file } of COUPON_URLS) {
    const filePath = path.join(OUT, file);
    if (fs.existsSync(filePath)) {
      console.log("skip", file);
      continue;
    }
    try {
      await download(url, filePath);
      console.log("ok", file);
    } catch (e) {
      console.error("fail", file, e.message);
    }
  }
  for (const { url, file } of PROMO_URLS) {
    const filePath = path.join(OUT, file);
    if (fs.existsSync(filePath)) {
      console.log("skip", file);
      continue;
    }
    try {
      await download(url, filePath);
      console.log("ok", file);
    } catch (e) {
      console.error("fail", file, e.message);
    }
  }
  console.log("done");
}

main();
