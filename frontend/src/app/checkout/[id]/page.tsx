"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

type Coupon = {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  merchant: { name: string };
};

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseInt(amountParam, 10) : 0;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !amountParam) return;
    fetch(apiUrl(`/api/coupons/${id}`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setCoupon)
      .catch(() => setCoupon(null));
  }, [id, amountParam]);

  async function pay() {
    if (!coupon || !amount || amount < coupon.price) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ couponId: coupon.id, amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace("/login?from=" + encodeURIComponent(`/checkout/${id}?amount=${amount}`));
        return;
      }
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Ошибка");
        return;
      }
      router.push("/me/coupons");
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  if (!id || !amountParam) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-5 py-12 text-center">
          <p className="text-slate-500">Укажите сумму</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary">На главную</Link>
        </main>
      </>
    );
  }

  if (coupon === undefined) return null;
  if (!coupon) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-5 py-12 text-center">
          <p className="text-slate-500">Купон не найден</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary">На главную</Link>
        </main>
      </>
    );
  }

  if (amount < coupon.price) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-5 py-12 text-center">
          <p className="text-slate-500">Сумма меньше минимальной ({coupon.price} ₽)</p>
          <Link href={`/coupon/${id}`} className="mt-4 inline-block font-semibold text-primary">К купону</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[600px] px-5 py-8">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <h1 className="mb-6 border-b-2 border-slate-100 pb-4 text-2xl font-extrabold">Детали заказа</h1>
          <div className="mb-4 flex justify-between gap-4 border-b border-slate-100 py-4">
            <span className="text-slate-500">Услуга:</span>
            <strong className="max-w-[60%] text-right">{coupon.title}</strong>
          </div>
          <div className="mb-6 flex justify-between border-b-0 py-4">
            <span className="text-slate-500">К оплате:</span>
            <strong className="text-2xl text-primary">{amount} ₽</strong>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={pay}
            disabled={loading}
            className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Обработка..." : `Оплатить ${amount} ₽`}
          </button>
          <Link
            href={`/coupon/${id}`}
            className="mt-4 block w-full rounded-xl border-2 border-slate-200 py-3 text-center font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Вернуться назад
          </Link>
        </div>
      </main>
    </>
  );
}
