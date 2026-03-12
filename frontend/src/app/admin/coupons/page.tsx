"use client";

import { useCallback, useEffect, useState } from "react";
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
  conditionsHtml?: string;
  descriptionHtml?: string;
  addressHtml?: string;
  merchantId?: string;
  categoryId?: string;
  merchant: { id: string; name: string };
  category: { id: string; name: string };
};

type Merchant = { id: string; name: string };
type Category = { id: string; slug: string; name: string };

const defaultHtml = "<p></p>";

export default function AdminCouponsPage() {
  const [list, setList] = useState<Coupon[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [noGeo, setNoGeo] = useState(false);
  const [city, setCity] = useState("Москва");
  const [conditionsHtml, setConditionsHtml] = useState(defaultHtml);
  const [descriptionHtml, setDescriptionHtml] = useState(defaultHtml);
  const [addressHtml, setAddressHtml] = useState(defaultHtml);
  const [imageUrl, setImageUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    const opts: RequestInit = { credentials: "include" };
    Promise.all([
      fetch(apiUrl("/api/coupons"), opts).then((r) => r.json()).catch(() => []),
      fetch(apiUrl("/api/merchants"), opts).then((r) => r.json()).catch(() => []),
      fetch(apiUrl("/api/categories"), opts).then((r) => r.json()).catch(() => []),
    ]).then(([coupons, m, c]) => {
      setList(coupons);
      setMerchants(m);
      setCategories(c);
      if (m.length && !merchantId) setMerchantId(m[0].id);
      if (c.length && !categoryId) setCategoryId(c[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (merchants.length && !merchantId) setMerchantId(merchants[0].id);
    if (categories.length && !categoryId) setCategoryId(categories[0].id);
  }, [merchants, categories, merchantId, categoryId]);

  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setMerchantId(c.merchantId ?? c.merchant.id);
    setCategoryId(c.categoryId ?? c.category.id);
    setTitle(c.title);
    const p = c.price;
    setPrice(String(p));
    const hasDiscount = c.oldPrice != null && c.discountPercent != null;
    setOldPrice(hasDiscount ? String(c.oldPrice) : String(p));
    setDiscountPercent(hasDiscount ? String(c.discountPercent) : "0");
    setNoGeo(c.noGeo);
    setCity(c.city ?? "Москва");
    setConditionsHtml(c.conditionsHtml ?? defaultHtml);
    setDescriptionHtml(c.descriptionHtml ?? defaultHtml);
    setAddressHtml(c.addressHtml ?? defaultHtml);
    setImageUrl(c.imageUrl ?? "");
    setSubmitError("");
    setShowForm(true);
  }

  const priceNum = parseInt(price, 10) || 0;
  const oldNum = parseInt(oldPrice, 10);
  const discountNum = parseInt(discountPercent, 10);
  const useDiscount = oldPrice.trim() !== "" && discountPercent.trim() !== "";
  const computedPrice = useDiscount && !isNaN(oldNum) && !isNaN(discountNum) && discountNum <= 99
    ? Math.round(oldNum * (1 - discountNum / 100))
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
    if (!title.trim() || !merchantId || !categoryId) {
      setSubmitError("Заполните название, мерчанта и категорию");
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
      const priceNum = parseInt(price, 10);
      if (isNaN(priceNum) || priceNum < 0) {
        setSubmitError("Заполните цену или старую цену и скидку");
        return;
      }
    }
    setSubmitting(true);
    const body: Record<string, unknown> = {
      merchantId,
      categoryId,
      title: title.trim(),
      noGeo,
      city: noGeo ? null : city,
      conditionsHtml: conditionsHtml || defaultHtml,
      descriptionHtml: descriptionHtml || defaultHtml,
      addressHtml: addressHtml || defaultHtml,
      imageUrl: imageUrl.trim() || null,
    };
    if (oldPrice.trim() !== "" && discountPercent.trim() !== "") {
      body.oldPrice = parseInt(oldPrice, 10);
      body.discountPercent = parseInt(discountPercent, 10);
    } else {
      body.price = parseInt(price, 10);
    }
    const url = editingId ? `/api/coupons/${editingId}` : "/api/coupons";
    const method = editingId ? "PATCH" : "POST";
    fetch(apiUrl(url), {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error((d as { error?: string }).error ?? "Ошибка"); });
        return r.json();
      })
      .then(() => {
        setEditingId(null);
        setTitle("");
        setPrice("");
        setOldPrice("");
        setDiscountPercent("");
        setNoGeo(false);
        setCity("Москва");
        setConditionsHtml(defaultHtml);
        setDescriptionHtml(defaultHtml);
        setAddressHtml(defaultHtml);
        setImageUrl("");
        setShowForm(false);
        load();
      })
      .catch((err: Error) => setSubmitError(err.message ?? "Ошибка"))
      .finally(() => setSubmitting(false));
  }

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold">Все купоны платформы</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2.5 sm:px-5 text-sm sm:text-base font-semibold text-white transition hover:bg-primary/90 w-full sm:w-auto min-h-[44px]"
          >
            + Создать купон
          </button>
        )}
      </div>

      {showForm && (
        <div id="view-shared-coupon-form" className="mb-4 sm:mb-6 max-w-full sm:max-w-[800px] rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm overflow-x-hidden">
          <h2 className="border-b-2 border-slate-100 pb-4 sm:pb-5 text-lg sm:text-2xl font-extrabold">
            {editingId ? "Редактирование купона" : "Создание нового купона"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500">Привязать к мерчанту</label>
              <select
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="mt-1 min-h-[48px] w-full rounded-lg border border-slate-300 bg-slate-50 px-3 sm:px-4"
                required
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Название купона</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 text-base sm:text-lg font-semibold"
                required
              />
            </div>
            <div className="flex flex-col gap-3 sm:gap-5">
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
                <div className="min-w-0 flex-1">
                  <label className="block text-sm font-semibold text-slate-500">Старая цена (₽)</label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => handleOldPriceChange(e.target.value)}
                    min={priceNum}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 min-h-[48px]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-sm font-semibold text-slate-500">Скидка (%)</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    min={0}
                    max={99}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 min-h-[48px]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-sm font-semibold text-slate-500">Цена (актуальная, ₽)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrice(val);
                      const p = parseInt(val, 10);
                      if (!isNaN(p) && p >= 0) {
                        if (oldPrice.trim() === "") {
                          setOldPrice(val);
                          setDiscountPercent("0");
                        } else {
                          const o = parseInt(oldPrice, 10);
                          if (o >= p) {
                            const d = Math.round((1 - p / o) * 100);
                            setDiscountPercent(String(Math.min(99, Math.max(0, d))));
                          } else {
                            setOldPrice(val);
                            setDiscountPercent("0");
                          }
                        }
                      }
                    }}
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 font-bold text-primary min-h-[48px] bg-slate-50"
                    required
                  />
                </div>
              </div>
              {useDiscount && computedPrice != null && (
                <p className="text-sm text-slate-500">Итог к оплате: {computedPrice} ₽</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5">
              <div className="min-w-0 flex-1">
                <label className="block text-sm font-semibold text-slate-500">Категория</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 min-h-[48px] w-full rounded-lg border border-slate-300 bg-slate-50 px-3 sm:px-4"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-primary/10 p-4 sm:p-5">
              <label className="mb-4 flex cursor-pointer items-center gap-2.5 font-semibold text-primary">
                <input
                  type="checkbox"
                  id="noGeo"
                  checked={noGeo}
                  onChange={(e) => setNoGeo(e.target.checked)}
                  className="h-5 w-5 rounded accent-primary"
                />
                Без ГЕО привязки (Отображать во всех городах)
              </label>
              <div className={noGeo ? "opacity-50" : ""}>
                <label className="block text-sm font-semibold text-slate-700">Город действия</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={noGeo}
                  className="mt-1 min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-3 sm:px-4"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">URL или путь к изображению</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Условия (HTML)</label>
              <textarea value={conditionsHtml} onChange={(e) => setConditionsHtml(e.target.value)} className="mt-1 min-h-[80px] sm:h-[100px] w-full resize-y rounded-lg border border-slate-300 px-3 sm:px-4 py-3 leading-relaxed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Описание (HTML)</label>
              <textarea value={descriptionHtml} onChange={(e) => setDescriptionHtml(e.target.value)} className="mt-1 min-h-[80px] sm:h-[100px] w-full resize-y rounded-lg border border-slate-300 px-3 sm:px-4 py-3 leading-relaxed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Адреса (HTML)</label>
              <textarea value={addressHtml} onChange={(e) => setAddressHtml(e.target.value)} className="mt-1 min-h-16 h-20 w-full resize-y rounded-lg border border-slate-300 px-3 sm:px-4 py-3 leading-relaxed" />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
              <button type="submit" disabled={submitting} className="rounded-lg bg-primary py-3 sm:py-4 px-6 sm:px-8 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 min-h-[48px]">
                {submitting ? "Сохранение…" : editingId ? "Сохранить изменения" : "Создать"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setSubmitError(""); }} className="rounded-lg border-2 border-slate-200 bg-transparent py-3 sm:py-4 px-6 sm:px-8 font-semibold text-slate-500 min-h-[48px]">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Фото</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500 hidden md:table-cell">Мерчант</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Название</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Цена</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500 hidden sm:table-cell">ГЕО</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-2 py-2 sm:px-4 sm:py-2">
                  <img src={c.imageUrl ?? "/placeholder-coupon.svg"} alt="" className="h-8 w-12 sm:h-10 sm:w-16 rounded object-contain bg-slate-100" />
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium hidden md:table-cell">{c.merchant.name}</td>
                <td className="max-w-[140px] sm:max-w-[200px] truncate px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium" title={c.title}>{c.title}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-semibold">{c.price} ₽</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{c.noGeo ? "Все города" : c.city ?? "—"}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <button type="button" onClick={() => openEdit(c)} className="rounded-lg bg-primary px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-primary/90 min-h-[36px]">
                    Изменить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && !showForm && <p className="py-6 sm:py-8 text-center text-sm text-slate-500">Купонов пока нет</p>}
    </div>
  );
}
