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
    const token = document.cookie.match(/token=([^;]+)/)?.[1]?.trim();
    fetch(apiUrl("/api/merchant/transactions"), { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">История покупок</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">ID</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Дата</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Покупатель</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Купон</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Сумма</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Статус</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-sm text-slate-500">{t.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-sm">{new Date(t.createdAt).toLocaleString("ru")}</td>
                <td className="px-4 py-3 text-sm">{t.user.email}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm" title={t.coupon.title}>{t.coupon.title}</td>
                <td className="px-4 py-3 font-semibold">{t.amount} ₽</td>
                <td className="px-4 py-3">
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
      {list.length === 0 && <p className="py-8 text-center text-slate-500">Транзакций пока нет</p>}
    </div>
  );
}
