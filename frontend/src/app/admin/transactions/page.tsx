"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Tx = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { email: string } | null;
  coupon: { title: string; merchant: { name: string } } | null;
  certificate: { title: string; merchant: { name: string } } | null;
};

export default function AdminTransactionsPage() {
  const [list, setList] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/transactions"), { credentials: "include" })
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">Транзакции</h1>
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">ID</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Дата</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Покупатель</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500 hidden md:table-cell">Мерчант</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Купон</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Сумма</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Статус</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-500">{t.id.slice(0, 8)}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{new Date(t.createdAt).toLocaleString("ru")}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm truncate max-w-[120px]">{t.user?.email ?? "—"}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden md:table-cell">{t.coupon?.merchant?.name ?? t.certificate?.merchant?.name ?? "—"}</td>
                <td className="max-w-[120px] sm:max-w-[180px] truncate px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm" title={t.coupon?.title ?? t.certificate?.title ?? ""}>{t.coupon?.title ?? t.certificate?.title ?? "—"}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-semibold">{t.amount} ₽</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    t.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p className="py-6 sm:py-8 text-center text-sm text-slate-500">Транзакций пока нет</p>}
    </div>
  );
}
