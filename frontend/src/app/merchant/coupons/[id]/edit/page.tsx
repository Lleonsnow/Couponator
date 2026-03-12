"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { CITIES } from "@/lib/cities";

type Coupon = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  discountPercent?: number | null;
  city: string | null;
  noGeo: boolean;
  imageUrl: string | null;
  conditionsHtml: string;
  descriptionHtml: string;
  addressHtml: string;
  category: { name: string };
};

const defaultHtml = "<p></p>";

export default function MerchantCouponEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [noGeo, setNoGeo] = useState(false);
  const [city, setCity] = useState("Москва");
  const [imageUrl, setImageUrl] = useState("");
  const [conditionsHtml, setConditionsHtml] = useState(defaultHtml);
  const [descriptionHtml, setDescriptionHtml] = useState(defaultHtml);
  const [addressHtml, setAddressHtml] = useState(defaultHtml);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/coupons/${id}`), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((c: Coupon) => {
        setCoupon(c);
        setTitle(c.title);
        const p = c.price;
        setPrice(String(p));
        const hasDiscount = c.oldPrice != null && c.discountPercent != null;
        setOldPrice(hasDiscount ? String(c.oldPrice) : String(p));
        setDiscountPercent(hasDiscount ? String(c.discountPercent) : "0");
        setNoGeo(c.noGeo);
        setCity(c.city ?? "Москва");
        setImageUrl(c.imageUrl ?? "");
        setConditionsHtml(c.conditionsHtml ?? defaultHtml);
        setDescriptionHtml(c.descriptionHtml ?? defaultHtml);
        setAddressHtml(c.addressHtml ?? defaultHtml);
      })
      .catch(() => setCoupon(null))
      .finally(() => setLoading(false));
  }, [id]);

  const priceNum = parseInt(price, 10) || 0;
  const oldNum = parseInt(oldPrice, 10);
  const useDiscount = oldPrice.trim() !== "" && discountPercent.trim() !== "";
  const computedPrice = useDiscount && !isNaN(oldNum)
    ? Math.round(oldNum * (1 - Math.min(99, Math.max(0, parseInt(discountPercent, 10) || 0)) / 100))
    : null;

  function handleOldPriceChange(val: string) {
    setOldPrice(val);
    const o = parseInt(val, 10);
    if (!isNaN(o) && o > 0 && priceNum > 0) {
      if (o < priceNum) {
        setOldPrice(String(priceNum));
        setDiscountPercent("0");
      } else {
        const d = Math.round((1 - priceNum / o) * 100);
        setDiscountPercent(String(Math.min(99, Math.max(0, d))));
      }
    }
  }

  function handleDiscountChange(val: string) {
    setDiscountPercent(val);
    const d = Math.min(99, Math.max(0, parseInt(val, 10) || 0));
    if (d < 100 && priceNum > 0) {
      const o = d >= 100 ? priceNum : Math.round(priceNum / (1 - d / 100));
      setOldPrice(String(Math.max(o, priceNum)));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!title.trim()) {
      setSubmitError("Заполните название");
      return;
    }
    if (useDiscount) {
      if (computedPrice == null || computedPrice < 0) {
        setSubmitError("Укажите старую цену и скидку 0–99%");
        return;
      }
      if (oldNum < priceNum) {
        setSubmitError("Старая цена не может быть меньше актуальной");
        return;
      }
    } else {
      if (isNaN(priceNum) || priceNum < 0) {
        setSubmitError("Заполните цену или старую цену и скидку");
        return;
      }
    }
    setSubmitting(true);
    const body: Record<string, unknown> = { title: title.trim(), noGeo, city: noGeo ? null : city, conditionsHtml: conditionsHtml || defaultHtml, descriptionHtml: descriptionHtml || defaultHtml, addressHtml: addressHtml || defaultHtml, imageUrl: imageUrl.trim() || null };
    if (oldPrice.trim() !== "" && discountPercent.trim() !== "") {
      body.oldPrice = parseInt(oldPrice, 10);
      body.discountPercent = parseInt(discountPercent, 10);
    } else {
      body.price = priceNum;
    }
    fetch(apiUrl(`/api/coupons/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => { throw new Error(d.error ?? "Ошибка"); });
        router.push("/merchant/coupons");
      })
      .catch((err: Error) => setSubmitError(err.message ?? "Ошибка"))
      .finally(() => setSubmitting(false));
  }

  if (loading) return <p className="text-slate-500">Загрузка...</p>;
  if (!coupon) return <div><p className="text-slate-500">Купон не найден.</p><Link href="/merchant/coupons" className="mt-2 inline-block text-primary font-semibold">К списку купонов</Link></div>;

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">Редактирование купона</h1>
      <p className="mb-4 text-sm text-slate-500">Категория: {coupon.category.name}</p>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-500">Название купона</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 text-base font-semibold" required />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <label className="block text-sm font-semibold text-slate-500">Старая цена (₽)</label>
            <input type="number" value={oldPrice} onChange={(e) => handleOldPriceChange(e.target.value)} min={priceNum} className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 min-h-[48px]" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-sm font-semibold text-slate-500">Скидка (%)</label>
            <input type="number" value={discountPercent} onChange={(e) => handleDiscountChange(e.target.value)} min={0} max={99} className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 min-h-[48px]" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-sm font-semibold text-slate-500">Цена (актуальная, ₽)</label>
            <input type="number" value={price} onChange={(e) => {
              const val = e.target.value;
              setPrice(val);
              const p = parseInt(val, 10);
              if (!isNaN(p) && p >= 0) {
                if (oldPrice.trim() === "") { setOldPrice(val); setDiscountPercent("0"); } else {
                  const o = parseInt(oldPrice, 10);
                  if (o >= p) { const d = Math.round((1 - p / o) * 100); setDiscountPercent(String(Math.min(99, Math.max(0, d)))); }
                  else { setOldPrice(val); setDiscountPercent("0"); }
                }
              }
            }} min={0} className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 font-bold text-primary min-h-[48px] bg-slate-50" required />
          </div>
        </div>
        {useDiscount && computedPrice != null && <p className="text-sm text-slate-500">Итог к оплате: {computedPrice} ₽</p>}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
            <input type="checkbox" checked={noGeo} onChange={(e) => setNoGeo(e.target.checked)} className="h-5 w-5 rounded accent-primary" />
            Без ГЕО привязки
          </label>
          <div className={noGeo ? "opacity-50" : ""}>
            <label className="block text-sm font-semibold text-slate-600">Город</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} disabled={noGeo} className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4">
              {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500">URL или путь к изображению</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 min-h-[48px]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500">Условия (HTML)</label>
          <textarea value={conditionsHtml} onChange={(e) => setConditionsHtml(e.target.value)} className="mt-1 min-h-[80px] w-full resize-y rounded-lg border border-slate-300 px-3 sm:px-4 py-3 leading-relaxed" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500">Описание (HTML)</label>
          <textarea value={descriptionHtml} onChange={(e) => setDescriptionHtml(e.target.value)} className="mt-1 min-h-[80px] w-full resize-y rounded-lg border border-slate-300 px-3 sm:px-4 py-3 leading-relaxed" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500">Адреса (HTML)</label>
          <textarea value={addressHtml} onChange={(e) => setAddressHtml(e.target.value)} className="mt-1 min-h-[60px] w-full resize-y rounded-lg border border-slate-300 px-3 sm:px-4 py-3 leading-relaxed" />
        </div>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary py-3 px-6 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50">
            {submitting ? "Сохранение…" : "Сохранить"}
          </button>
          <Link href="/merchant/coupons" className="rounded-lg border-2 border-slate-200 py-3 px-6 font-semibold text-slate-600 hover:bg-slate-50">Отмена</Link>
        </div>
      </form>
    </div>
  );
}
