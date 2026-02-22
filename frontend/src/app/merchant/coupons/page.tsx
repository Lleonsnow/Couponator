"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Coupon = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  noGeo: boolean;
  imageUrl: string | null;
  category: { name: string };
};

export default function MerchantCouponsPage() {
  const [list, setList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1]?.trim();
    fetch(apiUrl("/api/merchant/coupons"), { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Ваши купоны</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Фото</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Название</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Мин. цена</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">ГЕО</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-2">
                  <img src={c.imageUrl ?? ""} alt="" className="h-10 w-16 rounded object-cover" />
                </td>
                <td className="max-w-[240px] truncate px-4 py-3 font-medium" title={c.title}>{c.title}</td>
                <td className="px-4 py-3 font-semibold">{c.price} ₽</td>
                <td className="px-4 py-3 text-sm">{c.noGeo ? "Все города" : c.city ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p className="py-8 text-center text-slate-500">Купонов пока нет</p>}
    </div>
  );
}
