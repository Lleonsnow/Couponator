"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

export default function AdminPage() {
  const [stats, setStats] = useState<{ merchants: number; coupons: number; turnover: number } | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/admin/stats"), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: { merchants: number; coupons: number; turnover: number }) => setStats(data))
      .catch(() => setStats({ merchants: 0, coupons: 0, turnover: 0 }));
  }, []);

  if (!stats) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div id="sa-view-dash">
      <h2 className="mt-0 mb-6 font-extrabold">Глобальная статистика</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Общий оборот</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{stats.turnover.toLocaleString("ru")} ₽</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Мерчантов</p>
          <p id="saStatMerch" className="mt-2 text-3xl font-extrabold text-primary">{stats.merchants}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Всего купонов</p>
          <p id="saStatCoupons" className="mt-2 text-3xl font-extrabold text-primary">{stats.coupons}</p>
        </div>
      </div>
    </div>
  );
}
