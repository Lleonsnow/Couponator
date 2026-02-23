"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

const SLUG_ICON: Record<string, string> = {
  entertainment: "🎳",
  hotels: "🏨",
  beauty: "💇‍♀️",
  auto: "🚗",
  food: "🍔",
  health: "🏥",
  education: "📚",
  sport: "🏋️",
  shops: "🛒",
  kids: "🧸",
  tours: "🗺️",
  events: "🎫",
  photo: "📸",
  cleaning: "🧹",
  delivery: "📦",
};

type Category = { id: string; slug: string; name: string };

export function CategoryTabs({
  selectedSlug,
  onSelect,
}: {
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const [list, setList] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(apiUrl("/api/categories"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 sm:gap-5 overflow-x-auto py-4 sm:py-6 scrollbar-none">
        <div className="h-14 w-14 sm:h-[68px] sm:w-[68px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-14 w-14 sm:h-[68px] sm:w-[68px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-14 w-14 sm:h-[68px] sm:w-[68px] shrink-0 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-nowrap gap-3 sm:gap-5 overflow-x-auto py-4 sm:py-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex min-w-[72px] sm:min-w-[80px] shrink-0 flex-col items-center gap-2 sm:gap-3 transition hover:-translate-y-1 ${
          !selectedSlug ? "opacity-100" : "opacity-70 hover:opacity-100"
        }`}
      >
        <span className="flex h-14 w-14 sm:h-[68px] sm:w-[68px] items-center justify-center rounded-xl bg-white text-xl sm:text-2xl shadow-sm transition hover:bg-primary/10">
          Все
        </span>
        <span className="text-center text-xs sm:text-sm font-semibold">Все</span>
      </button>
      {list.map((c) => {
        const active = selectedSlug === c.slug;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(active ? null : c.slug)}
            className={`flex min-w-[72px] sm:min-w-[80px] shrink-0 flex-col items-center gap-2 sm:gap-3 transition hover:-translate-y-1 ${
              active ? "opacity-100" : "opacity-70 hover:opacity-100"
            }`}
          >
            <span
              className={`flex h-14 w-14 sm:h-[68px] sm:w-[68px] items-center justify-center rounded-xl bg-white text-2xl sm:text-3xl shadow-sm transition hover:bg-primary/10 ${
                active ? "bg-primary/10 ring-2 ring-primary" : ""
              }`}
            >
              {SLUG_ICON[c.slug] ?? "📋"}
            </span>
            <span className="text-center text-xs sm:text-sm font-semibold">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}
