"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then((r) => {
        if (r.status === 401) { router.replace("/login"); return null; }
        return r.json();
      })
      .then((data: { role?: string | null } | null) => {
        if (data == null) return;
        if (String(data.role) === "ADMIN") setOk(true);
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ok) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-page-in py-24 text-center">
          <div className="admin-loader-spinner" />
          <p className="text-slate-500 font-semibold">Вход в панель управления...</p>
        </div>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "Дашборд", icon: "📊" },
    { href: "/admin/merchants", label: "Мерчанты", icon: "🏢" },
    { href: "/admin/coupons", label: "Все купоны", icon: "🎟" },
    { href: "/admin/transactions", label: "Транзакции", icon: "💳" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-4 sm:py-6">
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-extrabold text-slate-800">Панель управления</h2>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <aside className="lg:w-64 shrink-0 overflow-x-auto">
            <nav className="flex gap-2 lg:flex-col lg:gap-1 rounded-xl lg:rounded-2xl border border-slate-100 bg-white p-3 lg:p-5 shadow-sm lg:min-w-[16rem]">
              {nav.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 lg:gap-3 rounded-lg px-3 py-2.5 lg:px-4 lg:py-3 text-left font-semibold text-sm lg:text-base transition shrink-0 lg:shrink ${
                    pathname === href || (href !== "/admin" && pathname.startsWith(href))
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-lg lg:text-xl">{icon}</span>
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
    </div>
  );
}
