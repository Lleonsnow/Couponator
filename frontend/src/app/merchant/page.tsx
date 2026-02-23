"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

export default function MerchantPage() {
  const [stats, setStats] = useState<{ coupons: number; turnover: number } | null>(null);

  useEffect(() => {
    const opts: RequestInit = { credentials: "include" };
    Promise.all([
      fetch(apiUrl("/api/merchant/coupons"), opts).then((r) => r.json()),
      fetch(apiUrl("/api/merchant/transactions"), opts).then((r) => r.json()),
    ])
      .then(([coupons, transactions]) => {
        const turnover = (transactions as { amount: number }[]).reduce((s, t) => s + t.amount, 0);
        setStats({ coupons: (coupons as unknown[]).length, turnover });
      })
      .catch(() => setStats({ coupons: 0, turnover: 0 }));
  }, []);

  if (!stats) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">Сводка за месяц</h1>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <p className="text-xs sm:text-sm font-semibold text-slate-500">Сумма продаж</p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold text-primary">{stats.turnover.toLocaleString("ru")} ₽</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <p className="text-xs sm:text-sm font-semibold text-slate-500">Активные купоны</p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold text-primary">{stats.coupons}</p>
        </div>
      </div>
    </div>
  );
}
