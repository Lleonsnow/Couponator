"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCity } from "@/context/CityContext";
import { apiUrl } from "@/lib/api";

type User = { role: string; email?: string } | null;

function CityDropdown() {
  const { city, setCity, cities, allCitiesLabel } = useCity();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? [allCitiesLabel, ...cities].filter((c) =>
        c.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [allCitiesLabel, ...cities];

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 min-h-[44px] md:min-h-0"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="max-w-[140px] truncate font-medium">{city}</span>
        <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          role="listbox"
        >
          <div className="border-b border-slate-100 p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск города..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Поиск города"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">Ничего не найдено</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="option"
                  aria-selected={city === c}
                  onClick={() => { setCity(c); setOpen(false); }}
                  className={`block w-full truncate px-4 py-2.5 text-left text-sm transition ${city === c ? "bg-primary/10 font-semibold text-primary" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {c}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then((r) => r.json())
      .then((data: { role?: string | null; email?: string }) => (data?.role ? (data as User) : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "MERCHANT" ? "/merchant" : null;

  const cityDropdown = <CityDropdown />;

  const navLinks = (
    <>
      <Link href="/" className="text-[var(--muted)] hover:text-[var(--text)] py-2 md:py-0">
        Купоны
      </Link>
      <Link href="/promocodes" className="text-[var(--muted)] hover:text-[var(--text)] py-2 md:py-0">
        Промокоды
      </Link>
      <Link href="/me/coupons" className="text-[var(--muted)] hover:text-[var(--text)] py-2 md:py-0">
        Мои покупки
      </Link>
    </>
  );

  const userBlock = !loading &&
    (user ? (
      <>
        {dashboardHref && (
          <Link
            href={dashboardHref}
            className="text-[var(--muted)] font-semibold hover:text-[var(--text)] py-2 md:py-0"
            title={user.email}
          >
            {user.email ?? (user.role === "ADMIN" ? "Админка" : "Кабинет")}
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="rounded-full bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary min-h-[44px] md:min-h-0 w-full md:w-auto text-center"
        >
          Выйти
        </button>
      </>
    ) : (
      <button
        type="button"
        onClick={() => { router.push("/login"); setMenuOpen(false); }}
        className="rounded-full bg-[var(--text)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary min-h-[44px] md:min-h-0 w-full md:w-auto"
      >
        Вход
      </button>
    ));

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-14 md:min-h-[76px] max-w-[var(--container)] items-center justify-between gap-3 px-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-6">
          <Link href="/" className="text-xl sm:text-2xl font-extrabold text-primary shrink-0 truncate">
            Купонатор
          </Link>
          <div className="hidden lg:block">{cityDropdown}</div>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks}
          {userBlock}
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 md:h-11 md:w-11"
            aria-expanded={menuOpen}
            aria-label="Меню"
          >
            {menuOpen ? (
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" aria-hidden onClick={() => setMenuOpen(false)} />
            <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[280px] flex-col gap-4 border-l border-slate-200 bg-white p-5 shadow-xl lg:hidden">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
                {navLinks}
              </div>
              <div className="border-b border-slate-100 pb-4">
                <span className="mb-2 block text-sm text-slate-500">Город</span>
                {cityDropdown}
              </div>
              <div className="mt-auto flex flex-col gap-3">{userBlock}</div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
