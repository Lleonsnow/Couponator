"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

type Tx = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  coupon: {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number;
    category: { name: string };
  };
};

export default function MyCouponsPage() {
  const router = useRouter();
  const [list, setList] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1]?.trim();
    const opts: RequestInit = token ? { headers: { Authorization: `Bearer ${token}` }, credentials: "include" } : { credentials: "include" };
    fetch(apiUrl("/api/me/transactions"), opts)
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return [];
        }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-5 py-8">
        <h1 className="mb-8 text-3xl font-extrabold">Мои покупки</h1>
        {loading ? (
          <p className="text-slate-500">Загрузка...</p>
        ) : list.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-slate-600">У вас пока нет купленных купонов.</p>
            <Link href="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90">
              Перейти к купонам
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((tx) => (
              <Link
                key={tx.id}
                href={`/transaction/${tx.id}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <img
                  src={tx.coupon.imageUrl ?? "https://picsum.photos/seed/0/600/338"}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">{tx.coupon.title}</h3>
                  <p className="mt-auto text-xl font-extrabold text-primary">Номинал: {tx.amount} ₽</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString("ru")}
                    {tx.status !== "PAID" && ` · ${tx.status}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
