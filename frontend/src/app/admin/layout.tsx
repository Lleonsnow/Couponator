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
    const cookieMatch = document.cookie.match(/\btoken=([^;]+)/);
    const token = cookieMatch ? cookieMatch[1].trim() : null;
    const url = apiUrl("/api/auth/me");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch(url, { method: "GET", headers, credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
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
      <div className="mx-auto max-w-6xl px-5 py-6">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-800">Панель управления</h2>
        <div className="flex gap-8">
          <aside className="w-64 shrink-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <nav className="flex flex-col gap-1">
              {nav.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold transition ${
                    pathname === href || (href !== "/admin" && pathname.startsWith(href))
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xl">{icon}</span>
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
    </div>
  );
}
