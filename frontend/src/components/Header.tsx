"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCity } from "@/context/CityContext";
import { apiUrl } from "@/lib/api";

type User = { role: string; email?: string } | null;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { city, setCity, cities, allCitiesLabel } = useCity();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then((r) => r.json())
      .then((data: { role?: string | null; email?: string }) => (data?.role ? (data as User) : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  async function logout() {
    await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "MERCHANT" ? "/merchant" : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-[var(--container)] items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-extrabold text-primary">
            Купонатор
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--muted)] hover:border-slate-300 hover:text-[var(--text)]"
              aria-expanded={cityOpen}
            >
              <span className="max-w-[140px] truncate">{city}</span>
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {cityOpen && (
              <>
                <div className="fixed inset-0 z-40" aria-hidden onClick={() => setCityOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setCity(allCitiesLabel); setCityOpen(false); }}
                    className={`block w-full px-4 py-2 text-left text-sm ${city === allCitiesLabel ? "bg-primary/10 font-semibold text-primary" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {allCitiesLabel}
                  </button>
                  {cities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCity(c); setCityOpen(false); }}
                      className={`block w-full truncate px-4 py-2 text-left text-sm ${city === c ? "bg-primary/10 font-semibold text-primary" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--text)]">
            Купоны
          </Link>
          <Link href="/promocodes" className="text-[var(--muted)] hover:text-[var(--text)]">
            Промокоды
          </Link>
          <Link href="/me/coupons" className="text-[var(--muted)] hover:text-[var(--text)]">
            Мои купоны
          </Link>
          {!loading &&
            (user ? (
              <>
                {dashboardHref && (
                  <Link
                    href={dashboardHref}
                    className="text-[var(--muted)] font-semibold hover:text-[var(--text)]"
                    title={user.email}
                  >
                    {user.email ?? (user.role === "ADMIN" ? "Админка" : "Кабинет")}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
                >
                  Выйти
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-full bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
              >
                Вход
              </button>
            ))}
        </nav>
      </div>
    </header>
  );
}
