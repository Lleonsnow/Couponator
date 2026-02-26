"use client";

import { useState } from "react";
import { BannerTop } from "@/components/BannerTop";
import { BannerSide } from "@/components/BannerSide";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CouponGrid } from "@/components/CouponGrid";
import { SearchBar } from "@/components/SearchBar";
import { SidebarPromos } from "@/components/SidebarPromos";
import { SidebarStores } from "@/components/SidebarStores";

export function HomeContent() {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <section className="pb-2">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </section>
      <BannerTop />
      <CategoryTabs selectedSlug={categorySlug} onSelect={setCategorySlug} />
      <div className="mt-4 sm:mt-6 flex gap-6 lg:gap-8">
        <div className="min-w-0 flex-1">
          <CouponGrid categorySlug={categorySlug} searchQuery={searchQuery} />
        </div>
        <aside className="hidden w-80 shrink-0 space-y-6 lg:block">
          <SidebarPromos />
          <SidebarStores />
          <BannerSide />
        </aside>
      </div>
    </>
  );
}
