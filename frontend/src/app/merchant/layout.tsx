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
    const token = document.cookie.match(/token=([^;]+)/)?.[1]?.trim();
    const opts: RequestInit = token ? { headers: { Authorization: `Bearer ${token}` } } : { credentials: "include" };
    fetch(apiUrl("/api/auth/me"), opts)
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
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/merchant" className="text-xl font-bold text-primary">
            Кабинет партнера
          </Link>
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            На сайт
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 p-6">
        <aside className="w-64 shrink-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <nav className="flex flex-col gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg px-4 py-3 text-left font-semibold transition ${
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
        <main className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
