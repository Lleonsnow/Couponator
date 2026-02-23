"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

export default function MerchantLayout({
  children,
}: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((user: { role?: string }) => {
        if (user.role !== "MERCHANT") router.replace("/");
        else setOk(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ok) return <div className="flex min-h-screen items-center justify-center">Проверка доступа...</div>;

  const nav = [
    { href: "/merchant", label: "Дашборд" },
    { href: "/merchant/coupons", label: "Мои купоны" },
    { href: "/merchant/profile", label: "Профиль" },
    { href: "/merchant/transactions", label: "Заказы" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 sm:px-5 py-3 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/merchant" className="text-lg sm:text-xl font-bold text-primary truncate">
            Кабинет партнера
          </Link>
          <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm sm:text-base shrink-0">
            На сайт
          </Link>
        </div>
      </header>
      <div className="mx-auto flex flex-col lg:flex-row max-w-6xl gap-4 lg:gap-8 p-4 sm:p-6">
        <aside className="lg:w-64 shrink-0 overflow-x-auto">
          <nav className="flex gap-2 lg:flex-col lg:gap-1 rounded-xl lg:rounded-2xl border border-slate-100 bg-white p-3 lg:p-5 shadow-sm lg:min-w-[16rem]">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2.5 lg:px-4 lg:py-3 text-left font-semibold text-sm lg:text-base transition shrink-0 lg:shrink ${
                  (href === "/merchant" ? pathname === "/merchant" : pathname.startsWith(href))
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
