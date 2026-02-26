"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

type Promo = {
  id: string;
  store: string;
  logo: string;
};

export function SidebarStores() {
  const [list, setList] = useState<Promo[]>([]);

  useEffect(() => {
    fetch(apiUrl("/api/promocodes"))
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const seen = new Set<string>();
        const uniq: Promo[] = [];
        for (const p of arr) {
          if (!seen.has(p.store)) {
            seen.add(p.store);
            uniq.push(p);
          }
        }
        if (uniq.length <= 3) return uniq;
        for (let i = uniq.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
        }
        return uniq.slice(0, 3);
      })
      .then(setList)
      .catch(() => setList([]));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-extrabold">Популярные магазины</h3>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : (
        list.map((p) => (
          <Link
            key={p.id}
            href={`/promocode/${p.id}`}
            className="mb-2 flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-50"
          >
            <img
              src={p.logo}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-contain bg-white p-1"
            />
            <span className="font-semibold text-slate-900">{p.store}</span>
          </Link>
        ))
      )}
    </div>
  );
}
