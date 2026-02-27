"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
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
  } | null;
  certificate: {
    id: string;
    title: string;
    merchant: { name: string };
  } | null;
};

export default function MyCouponsPage() {
  const router = useRouter();
  const [list, setList] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/me/transactions"), { credentials: "include" })
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
      <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-6 sm:py-8">
        <h1 className="mb-8 text-3xl font-extrabold">Мои покупки</h1>
        {loading ? (
          <p className="text-slate-500">Загрузка...</p>
        ) : list.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-slate-600">У вас пока нет покупок.</p>
            <Link href="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90">
              Перейти к купонам
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((tx) => {
              const isCert = !!tx.certificate;
              const title = isCert ? tx.certificate!.title : tx.coupon!.title;
              const imageUrl = tx.coupon?.imageUrl ?? "/seed/coupon-bow.jpg";
              return (
                <Link
                  key={tx.id}
                  href={`/transaction/${tx.id}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {!isCert && (
                    <img
                      src={imageUrl}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  {isCert && (
                    <div className="aspect-video w-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Gift className="h-16 w-16 sm:h-20 sm:w-20" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">{title}</h3>
                    {isCert && tx.certificate?.merchant && (
                      <p className="mb-1 text-sm text-slate-500">Компания: {tx.certificate.merchant.name}</p>
                    )}
                    <p className="mt-auto text-xl font-extrabold text-primary">Номинал: {tx.amount} ₽</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString("ru")}
                      {tx.status !== "PAID" && ` · ${tx.status}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
