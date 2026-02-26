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

type Certificate = {
  id: string;
  title: string;
  merchant: { name: string };
};

const MIN_CERT_AMOUNT = 100;
const MAX_CERT_AMOUNT = 100_000;

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseInt(amountParam, 10) : 0;
  const isCert = searchParams.get("type") === "certificate";

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !amountParam) return;
    if (isCert) {
      fetch(apiUrl(`/api/certificates/${id}`))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setCertificate)
        .catch(() => setCertificate(null));
    } else {
      fetch(apiUrl(`/api/coupons/${id}`))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(setCoupon)
        .catch(() => setCoupon(null));
    }
  }, [id, amountParam, isCert]);

  async function pay() {
    if (isCert) {
      if (!certificate || !amount || amount < MIN_CERT_AMOUNT || amount > MAX_CERT_AMOUNT) return;
      setError("");
      setLoading(true);
      try {
        const res = await fetch(apiUrl("/api/checkout"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ certificateId: certificate.id, amount }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.replace("/login?from=" + encodeURIComponent(`/checkout/${id}?amount=${amount}&type=certificate`));
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
    } else {
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
  }

  const backHref = isCert ? "/" : `/coupon/${id}`;

  if (!id || !amountParam) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-8 sm:py-12 text-center">
          <p className="text-slate-500 text-sm sm:text-base">Укажите сумму</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary">На главную</Link>
        </main>
      </>
    );
  }

  const loadingItem = isCert ? certificate === undefined : coupon === undefined;
  const noItem = isCert ? certificate === null : coupon === null;
  if (loadingItem) return null;
  if (noItem) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-8 sm:py-12 text-center">
          <p className="text-slate-500 text-sm sm:text-base">{isCert ? "Сертификат не найден" : "Купон не найден"}</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary">На главную</Link>
        </main>
      </>
    );
  }

  const minAmount = isCert ? MIN_CERT_AMOUNT : (coupon as Coupon).price;
  if (amount < minAmount) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-8 sm:py-12 text-center">
          <p className="text-slate-500 text-sm sm:text-base">Сумма меньше минимальной ({minAmount} ₽)</p>
          <Link href={backHref} className="mt-4 inline-block font-semibold text-primary">Назад</Link>
        </main>
      </>
    );
  }
  if (isCert && amount > MAX_CERT_AMOUNT) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-8 sm:py-12 text-center">
          <p className="text-slate-500 text-sm sm:text-base">Сумма больше максимальной ({MAX_CERT_AMOUNT.toLocaleString("ru-RU")} ₽)</p>
          <Link href={backHref} className="mt-4 inline-block font-semibold text-primary">Назад</Link>
        </main>
      </>
    );
  }

  const title = isCert ? (certificate as Certificate).title : (coupon as Coupon).title;
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[600px] px-4 sm:px-5 py-6 sm:py-8">
        <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-5 sm:p-8 shadow-sm">
          <h1 className="mb-4 sm:mb-6 border-b-2 border-slate-100 pb-3 sm:pb-4 text-xl sm:text-2xl font-extrabold">Детали заказа</h1>
          <div className="mb-4 flex justify-between gap-4 border-b border-slate-100 py-4">
            <span className="text-slate-500">{isCert ? "Сертификат:" : "Услуга:"}</span>
            <strong className="max-w-[60%] text-right">{title}</strong>
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
            className="w-full rounded-xl bg-primary py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 min-h-[48px]"
          >
            {loading ? "Обработка..." : `Оплатить ${amount} ₽`}
          </button>
          <Link
            href={backHref}
            className="mt-4 block w-full rounded-xl border-2 border-slate-200 py-3 text-center font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Вернуться назад
          </Link>
        </div>
      </main>
    </>
  );
}
