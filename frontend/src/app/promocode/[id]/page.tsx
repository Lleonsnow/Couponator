"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

type Promo = {
  id: string;
  store: string;
  title: string;
  code: string;
  discount: string;
  desc: string;
  logo: string;
  link: string;
};

export default function PromocodePage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<Promo | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/promocodes/${id}`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setItem)
      .catch(() => setItem(null));
  }, [id]);

  if (item === undefined) return null;
  if (!item)
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[var(--container)] px-5 py-12 text-center">
          <p className="text-slate-500">Промокод не найден</p>
          <Link href="/promocodes" className="mt-4 inline-block text-primary font-semibold">
            К списку промокодов
          </Link>
        </main>
      </>
    );

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[600px] px-5 py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex gap-4">
            <img
              src={item.logo}
              alt=""
              className="h-16 w-20 shrink-0 object-contain rounded-lg border border-slate-100"
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {item.store}
              </div>
              <h1 className="mt-1 text-xl font-extrabold text-slate-900">
                {item.title}
              </h1>
            </div>
          </div>
          <p className="mb-6 text-slate-600">{item.desc}</p>
          <div className="mb-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
            <span className="font-mono text-lg font-bold text-primary">
              {item.code}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-2xl font-extrabold text-orange-500">
              {item.discount}
            </span>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              Перейти на сайт
            </a>
          </div>
          <Link
            href="/promocodes"
            className="mt-6 inline-block text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Все промокоды
          </Link>
        </div>
      </main>
    </>
  );
}
