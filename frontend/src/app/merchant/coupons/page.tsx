"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
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
    fetch(apiUrl("/api/merchant/coupons"), { credentials: "include" })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">Ваши купоны</h1>
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200">
        <table className="w-full min-w-[320px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Фото</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Название</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Мин. цена</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500 hidden sm:table-cell">ГЕО</th>
              <th className="border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-2 py-2 sm:px-4 sm:py-2">
                  <img src={c.imageUrl ?? "/placeholder-coupon.svg"} alt="" className="h-8 w-12 sm:h-10 sm:w-16 rounded object-contain bg-slate-100" />
                </td>
                <td className="max-w-[140px] sm:max-w-[240px] truncate px-2 py-2 sm:px-4 sm:py-3 text-sm font-medium" title={c.title}>{c.title}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm font-semibold">{c.price} ₽</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{c.noGeo ? "Все города" : c.city ?? "—"}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <Link href={`/merchant/coupons/${c.id}/edit`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    <Pencil className="h-4 w-4" />
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p className="py-6 sm:py-8 text-center text-sm text-slate-500">Купонов пока нет</p>}
    </div>
  );
}
