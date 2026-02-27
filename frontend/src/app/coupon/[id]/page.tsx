"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

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
  category: { name: string; slug: string };
  merchant: { id: string; name: string };
};

type TabId = "cond" | "desc" | "gar" | "addr" | "rev";

export default function CouponPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [similar, setSimilar] = useState<Coupon[]>([]);
  const [tab, setTab] = useState<TabId>("cond");
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [modalCertOpen, setModalCertOpen] = useState(false);
  const [certAmount, setCertAmount] = useState(100);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/coupons/${id}`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((c: Coupon) => {
        setCoupon(c);
        return Promise.all([Promise.resolve(c), fetch(apiUrl("/api/coupons")).then((r) => r.json())]);
      })
      .then(([c, list]: [Coupon, Coupon[]]) => {
        const arr = Array.isArray(list) ? list : [];
        const same = arr.filter((x) => x.category?.slug === c.category?.slug && x.id !== c.id);
        const other = arr.filter((x) => x.id !== c.id && !same.find((s) => s.id === x.id));
        setSimilar([...same.slice(0, 3), ...other.slice(0, Math.max(0, 3 - same.length))].slice(0, 3));
      })
      .catch(() => setCoupon(null));
  }, [id]);

  if (!id) return null;
  if (coupon === undefined) return null;
  if (!coupon) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-8 sm:py-12 text-center">
          <p className="text-slate-500 text-sm sm:text-base">Купон не найден</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary">На главную</Link>
        </main>
      </>
    );
  }

  const geoLabel = coupon.noGeo ? "Все города" : coupon.city ?? "—";
  const total = coupon.price * quantity;

  const tabs: { id: TabId; label: string }[] = [
    { id: "cond", label: "Условия" },
    { id: "desc", label: "Описание" },
    { id: "gar", label: "Гарантии" },
    { id: "addr", label: "Адреса" },
    { id: "rev", label: "Отзывы" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-6 sm:py-8">
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="grid gap-6 sm:gap-8 p-4 sm:p-6 lg:p-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <img
                src={coupon.imageUrl ?? "/seed/coupon-bow.jpg"}
                alt=""
                className="aspect-video w-full rounded-xl object-cover shadow-sm"
              />
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-slate-300" />
                <div>
                  <p className="font-bold text-slate-900">{coupon.merchant.name}</p>
                  <p className="text-sm text-slate-500">Партнер</p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">{coupon.category.name}</span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {geoLabel}
                </span>
              </div>
              <h1 className="mb-4 sm:mb-6 text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl">{coupon.title}</h1>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                {coupon.oldPrice != null && coupon.discountPercent != null && coupon.discountPercent > 0 ? (
                  <div className="mb-4">
                    <div className="mb-2 inline-flex items-center rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm">
                      −{coupon.discountPercent}%
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xl font-extrabold text-primary">{coupon.price.toLocaleString("ru-RU")} ₽</span>
                      <span className="text-slate-500 line-through" style={{ fontSize: "1.625rem" }}>{coupon.oldPrice.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 flex justify-end">
                    <span className="text-2xl font-extrabold text-primary">{coupon.price.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setQuantity(1); setModalOpen(true); }}
                  className="w-full rounded-xl bg-primary py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition hover:bg-primary/90 min-h-[48px]"
                >
                  Купить
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch(apiUrl(`/api/merchants/${coupon.merchant.id}/certificate`));
                    if (!r.ok) return;
                    const cert = await r.json();
                    setCertificateId(cert.id);
                    setCertAmount(100);
                    setModalCertOpen(true);
                  }}
                  className="mt-3 w-full rounded-xl bg-orange-500 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition hover:bg-orange-600 min-h-[48px]"
                >
                  Подарочный сертификат
                </button>
              </div>

              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
                  <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Количество купонов</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold outline-none focus:border-primary"
                    />
                    <p className="mb-4 text-slate-600">
                      Сумма: <strong className="text-primary">{total.toLocaleString("ru-RU")} ₽</strong>
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="flex-1 rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/checkout/${coupon.id}?amount=${total}`)}
                        className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
                      >
                        Купить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalCertOpen && certificateId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalCertOpen(false)}>
                  <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Подарочный сертификат</h3>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Сумма (₽)</label>
                    <input
                      type="number"
                      min={100}
                      max={100000}
                      value={certAmount}
                      onChange={(e) => setCertAmount(Math.min(100000, Math.max(100, parseInt(e.target.value, 10) || 100)))}
                      className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-semibold outline-none focus:border-primary"
                    />
                    <p className="mb-4 text-slate-600">
                      К оплате: <strong className="text-primary">{certAmount.toLocaleString("ru-RU")} ₽</strong>
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setModalCertOpen(false)}
                        className="flex-1 rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/checkout/${certificateId}?amount=${certAmount}&type=certificate`)}
                        className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
                      >
                        Купить подарочный сертификат
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-10">
            <div className="mb-6 sm:mb-8 flex gap-4 sm:gap-8 border-b-2 border-slate-100 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 border-b-2 pb-3 sm:pb-4 text-sm sm:text-base font-semibold transition -mb-0.5 ${
                    tab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="prose prose-slate max-w-none text-slate-600">
              {tab === "cond" && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(coupon.conditionsHtml) }} />}
              {tab === "desc" && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(coupon.descriptionHtml) }} />}
              {tab === "gar" && <p>Все услуги сертифицированы. Возврат средств возможен в течение 14 дней.</p>}
              {tab === "addr" && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(coupon.addressHtml) }} />}
              {tab === "rev" && <p>Отзывов пока нет.</p>}
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-6 sm:mt-10 border-t border-slate-100 pt-6 sm:pt-8">
            <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">Похожие купоны</h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((c) => (
                <Link
                  key={c.id}
                  href={`/coupon/${c.id}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={c.imageUrl ?? "/seed/coupon-bow.jpg"}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <div className="mb-1 sm:mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase text-primary truncate">{c.category.name}</span>
                      <span className="text-xs text-slate-500 shrink-0">{c.noGeo ? "Все города" : c.city ?? "—"}</span>
                    </div>
                    <h3 className="mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base font-semibold">{c.title}</h3>
                    <p className="mt-auto text-base sm:text-lg font-extrabold">От {c.price} ₽</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
