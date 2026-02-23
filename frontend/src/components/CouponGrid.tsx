"use client";

import { useEffect, useState } from "react";
import { useCity } from "@/context/CityContext";
import { apiUrl } from "@/lib/api";
import { CouponCard } from "./CouponCard";

type Coupon = {
  id: string;
  title: string;
  price: number;
  city: string | null;
  noGeo: boolean;
  imageUrl: string | null;
  category: { name: string; slug: string };
  merchant: { name: string };
};

export function CouponGrid({
  categorySlug,
  searchQuery,
}: {
  categorySlug: string | null;
  searchQuery: string;
}) {
  const { city: selectedCity, allCitiesLabel } = useCity();
  const [list, setList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/coupons"))
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filtered = list.filter((c) => {
    const matchCity = selectedCity === allCitiesLabel || c.noGeo || c.city === selectedCity;
    const matchCat = !categorySlug || c.category.slug === categorySlug;
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.merchant.name.toLowerCase().includes(q);
    return matchCity && matchCat && matchSearch;
  });

  if (loading) return <div className="py-6 sm:py-8 text-center text-sm sm:text-base text-slate-500">Загрузка...</div>;
  if (filtered.length === 0)
    return (
      <div className="rounded-xl sm:rounded-2xl bg-white py-10 sm:py-16 text-center text-sm sm:text-base text-slate-500 px-4">
        {q ? "По вашему запросу ничего не найдено" : categorySlug ? "В этой категории купонов пока нет" : "Купонов пока нет"}
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((c) => (
        <CouponCard
          key={c.id}
          id={c.id}
          title={c.title}
          category={c.category.name}
          city={c.noGeo ? "Все города" : c.city ?? "—"}
          price={c.price}
          imageUrl={c.imageUrl ?? "https://picsum.photos/seed/0/600/338"}
        />
      ))}
    </div>
  );
}
