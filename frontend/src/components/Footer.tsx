import Link from "next/link";
import { FooterDocumentsDropdown } from "./FooterDocumentsDropdown";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-5">
        <nav className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <Link href="/about" className="font-medium text-slate-500 transition hover:text-primary">
            О компании
          </Link>
          <Link href="/contacts" className="font-medium text-slate-500 transition hover:text-primary">
            Контакты
          </Link>
          <FooterDocumentsDropdown />
        </nav>
        <p className="text-center text-xs sm:text-sm text-slate-400">
          ТОО &quot;Netgain solutions&quot;
        </p>
      </div>
    </footer>
  );
}
