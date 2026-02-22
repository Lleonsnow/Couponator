"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState<{ merchants: number; coupons: number; turnover: number } | null>(null);

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1]?.trim();
    const opts: RequestInit = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    Promise.all([
      fetch(apiUrl("/api/merchants"), opts).then((r) => r.json()),
      fetch(apiUrl("/api/coupons"), opts).then((r) => r.json()),
      fetch(apiUrl("/api/transactions"), opts).then((r) => r.json()),
    ])
      .then(([merchants, coupons, transactions]) => {
        const turnover = (transactions as { amount: number }[]).reduce((s, t) => s + t.amount, 0);
        setStats({
          merchants: (merchants as unknown[]).length,
          coupons: (coupons as unknown[]).length,
          turnover,
        });
      })
      .catch(() => setStats({ merchants: 0, coupons: 0, turnover: 0 }));
  }, []);

  if (!stats) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Глобальная статистика</h1>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Общий оборот</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{stats.turnover.toLocaleString("ru")} ₽</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Мерчантов</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{stats.merchants}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Всего купонов</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{stats.coupons}</p>
        </div>
      </div>
    </div>
  );
}
