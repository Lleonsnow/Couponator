"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { CITIES } from "@/lib/cities";

type Coupon = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  noGeo: boolean;
  imageUrl: string | null;
  merchant: { name: string };
  category: { name: string };
};

type Merchant = { id: string; name: string };
type Category = { id: string; slug: string; name: string };

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/\btoken=([^;]+)/);
  return m ? m[1].trim() : null;
}

const defaultHtml = "<p></p>";

export default function AdminCouponsPage() {
  const [list, setList] = useState<Coupon[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [merchantId, setMerchantId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [noGeo, setNoGeo] = useState(false);
  const [city, setCity] = useState("Москва");
  const [conditionsHtml, setConditionsHtml] = useState(defaultHtml);
  const [descriptionHtml, setDescriptionHtml] = useState(defaultHtml);
  const [addressHtml, setAddressHtml] = useState(defaultHtml);
  const [imageUrl, setImageUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    const token = getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const opts: RequestInit = { headers, credentials: "include" };
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const priceNum = parseInt(price, 10);
    if (!title.trim() || isNaN(priceNum) || priceNum < 0 || !merchantId || !categoryId) {
      setSubmitError("Заполните название, цену, мерчанта и категорию");
      return;
    }
    setSubmitting(true);
    const token = getToken();
    fetch(apiUrl("/api/coupons"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({
        merchantId,
        categoryId,
        title: title.trim(),
        price: priceNum,
        noGeo,
        city: noGeo ? null : city,
        conditionsHtml: conditionsHtml || defaultHtml,
        descriptionHtml: descriptionHtml || defaultHtml,
        addressHtml: addressHtml || defaultHtml,
        imageUrl: imageUrl.trim() || null,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error((d as { error?: string }).error ?? "Ошибка"); });
        return r.json();
      })
      .then(() => {
        setTitle("");
        setPrice("");
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Все купоны платформы</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90"
          >
            + Создать купон
          </button>
        )}
      </div>

      {showForm && (
        <div id="view-shared-coupon-form" className="mb-6 max-w-[800px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="border-b-2 border-slate-100 pb-5 text-2xl font-extrabold">
            Создание нового купона
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500">Привязать к мерчанту</label>
              <select
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4"
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-semibold"
                required
              />
            </div>
            <div className="flex flex-wrap gap-5">
              <div className="min-w-[200px] flex-1">
                <label className="block text-sm font-semibold text-slate-500">Базовая цена (₽)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={0}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-bold text-primary"
                  required
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <label className="block text-sm font-semibold text-slate-500">Категория</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-primary/10 p-5">
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
                  className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-4"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">URL изображения</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Условия (HTML)</label>
              <textarea value={conditionsHtml} onChange={(e) => setConditionsHtml(e.target.value)} className="mt-1 h-[100px] w-full resize-y rounded-lg border border-slate-300 px-4 py-3 leading-relaxed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Описание (HTML)</label>
              <textarea value={descriptionHtml} onChange={(e) => setDescriptionHtml(e.target.value)} className="mt-1 h-[100px] w-full resize-y rounded-lg border border-slate-300 px-4 py-3 leading-relaxed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Адреса (HTML)</label>
              <textarea value={addressHtml} onChange={(e) => setAddressHtml(e.target.value)} className="mt-1 h-20 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 leading-relaxed" />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div className="mt-4 flex gap-4">
              <button type="submit" disabled={submitting} className="rounded-lg bg-primary py-4 px-8 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50">
                {submitting ? "Сохранение…" : "Сохранить изменения"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setSubmitError(""); }} className="rounded-lg border-2 border-slate-200 bg-transparent py-4 px-8 font-semibold text-slate-500">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Фото</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Мерчант</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Название</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Цена</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">ГЕО</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-2">
                  <img src={c.imageUrl ?? ""} alt="" className="h-10 w-16 rounded object-cover" />
                </td>
                <td className="px-4 py-3 text-sm font-medium">{c.merchant.name}</td>
                <td className="max-w-[200px] truncate px-4 py-3 font-medium" title={c.title}>{c.title}</td>
                <td className="px-4 py-3 font-semibold">{c.price} ₽</td>
                <td className="px-4 py-3 text-sm">{c.noGeo ? "Все города" : c.city ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && !showForm && <p className="py-8 text-center text-slate-500">Купонов пока нет</p>}
    </div>
  );
}
