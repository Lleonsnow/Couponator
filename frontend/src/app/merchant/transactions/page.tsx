"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Tx = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { email: string };
  coupon: { title: string };
};

export default function MerchantTransactionsPage() {
  const [list, setList] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/merchant/transactions"), { credentials: "include" })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">История покупок</h1>
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200">
        <table className="w-full min-w-[380px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">ID</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Дата</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500 hidden md:table-cell">Покупатель</th>
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
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden md:table-cell truncate max-w-[120px]">{t.user.email}</td>
                <td className="max-w-[100px] sm:max-w-[200px] truncate px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm" title={t.coupon.title}>{t.coupon.title}</td>
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
