"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const ITEMS = [
  { href: "/documents/user-agreement", label: "Пользовательское соглашение" },
  { href: "/documents/privacy", label: "Политика обработки персональных данных" },
  { href: "/documents/offer", label: "Публичная оферта" },
  { href: "/documents/org-card", label: "Карточка организации" },
];

export function FooterDocumentsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="inline-flex items-center gap-1 font-medium text-slate-500 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Документы
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-2 min-w-[220px] sm:min-w-[280px] bg-white rounded-lg shadow-lg border border-slate-200 z-50"
          onMouseLeave={() => setOpen(false)}
        >
          {ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
