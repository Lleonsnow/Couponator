"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function PromocodesPage() {
  const [list, setList] = useState<Promo[]>([]);

  useEffect(() => {
    fetch(apiUrl("/api/promocodes"))
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]));
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-5 py-8">
        <h1 className="mb-2 text-3xl font-extrabold">Бесплатные промокоды</h1>
        <p className="mb-8 text-slate-500">
          Скопируйте промокод и используйте его при оформлении заказа на сайте партнера.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {list.map((p) => (
            <div
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <Link
                href={`/promocode/${p.id}`}
                className="flex gap-4 border-b border-slate-100 p-4 transition hover:bg-slate-50/50"
              >
                <img
                  src={p.logo}
                  alt=""
                  className="h-[50px] w-[70px] shrink-0 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {p.store}
                  </div>
                  <h2 className="mt-1 text-base font-bold leading-snug text-slate-900 line-clamp-2">
                    {p.title}
                  </h2>
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <p className="mb-4 min-h-[38px] text-[13px] text-slate-500 line-clamp-2">
                  {p.desc}
                </p>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="text-[22px] font-extrabold text-orange-500">
                    {p.discount}
                  </span>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary/90"
                  >
                    Перейти
                  </a>
                </div>
                <Link
                  href={`/promocode/${p.id}`}
                  className="rounded-lg border border-dashed border-primary/50 bg-primary/5 py-3 text-center font-mono text-base font-bold text-primary"
                >
                  {p.code}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
