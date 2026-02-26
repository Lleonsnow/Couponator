"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

type Tx = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { email: string };
  coupon: {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number;
    merchant: { name: string };
    category: { name: string };
  } | null;
  certificate: {
    id: string;
    title: string;
    merchant: { name: string };
  } | null;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-5 first:pt-0 last:border-0">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-right font-semibold text-slate-900 max-w-[60%]">{value}</span>
    </div>
  );
}

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [tx, setTx] = useState<Tx | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/me/transactions/${id}`), { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        if (r.status === 404 || !r.ok) {
          setError(true);
          return null;
        }
        return r.json();
      })
      .then(setTx)
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-6 sm:py-8">
          <p className="text-slate-500">Загрузка...</p>
        </main>
      </>
    );
  }

  if (error || !tx) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-6 sm:py-8">
          <p className="text-slate-600">Транзакция не найдена.</p>
          <Link href="/me/coupons" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary/90">
            К списку покупок
          </Link>
        </main>
      </>
    );
  }

  const dateStr = new Date(tx.createdAt).toLocaleString("ru");
  const statusLabel = tx.status === "PAID" ? "Успешно (Оплачен)" : tx.status === "PENDING" ? "В ожидании" : tx.status;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-6 sm:py-8">
        <div className="mx-auto max-w-[600px] rounded-2xl border border-slate-100 bg-white p-6 sm:p-10 shadow-md">
          <h1 className="border-b-2 border-slate-100 pb-5 text-2xl font-extrabold text-slate-900">
            Транзакция {tx.id}
          </h1>
          <div className="space-y-0">
            <Row label="Дата и время" value={dateStr} />
            <Row label="Покупатель" value={tx.user.email} />
            <Row label="Компания" value={tx.coupon?.merchant.name ?? tx.certificate?.merchant.name ?? "—"} />
            <Row label={tx.certificate ? "Сертификат" : "Название купона"} value={tx.coupon?.title ?? tx.certificate?.title ?? "—"} />
            <Row
              label="Статус оплаты"
              value={
                <span
                  className={
                    tx.status === "PAID"
                      ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600"
                      : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600"
                  }
                >
                  {statusLabel}
                </span>
              }
            />
            <Row
              label="Итоговая сумма"
              value={<span className="text-2xl text-primary font-extrabold">{tx.amount} ₽</span>}
            />
          </div>
          <Link
            href="/me/coupons"
            className="mt-8 block w-full rounded-xl bg-primary py-3.5 text-center font-semibold text-white transition hover:bg-primary/90"
          >
            Вернуться к списку
          </Link>
        </div>
      </main>
    </>
  );
}
