"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { apiUrl } from "@/lib/api";

type Promo = {
  id: string;
  store: string;
  title: string;
  discount: string;
  logo: string;
};

export function SidebarPromos() {
  const [list, setList] = useState<Promo[]>([]);

  useEffect(() => {
    fetch(apiUrl("/api/promocodes"))
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setList([]));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-extrabold">Топ промокоды</h3>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : (
        <>
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/promocode/${p.id}`}
              className="mb-2 flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
            >
              <img
                src={p.logo}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border border-slate-100 object-contain bg-white p-1"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {p.store}
                </div>
                <div className="truncate text-sm font-semibold text-slate-900" title={p.title}>
                  {p.title}
                </div>
                <div className="text-sm font-extrabold text-orange-500">
                  {p.discount}
                </div>
              </div>
            </Link>
          ))}
          <Link
            href="/promocodes"
            className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
          >
            Все промокоды
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        </>
      )}
    </div>
  );
}
