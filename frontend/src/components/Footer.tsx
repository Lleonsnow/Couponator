import Link from "next/link";
import { FooterDocumentsDropdown } from "./FooterDocumentsDropdown";

const COMPANY = {
  name: 'ТОО "Netgain solutions"',
  bin: "251140035039",
  country: "Казахстан",
  region: "Мангистауская область",
  city: "г. Актау",
  address: "Микрорайон 14, здание 61",
  postalCode: "130000",
};

const SEP = <span className="text-slate-300 select-none mx-2" aria-hidden>·</span>;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-white py-10 sm:py-12">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-5">
        <nav className="mb-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
          >
            О компании
          </Link>
          <Link
            href="/contacts"
            className="text-sm font-medium text-slate-600 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
          >
            Контакты
          </Link>
          <FooterDocumentsDropdown />
        </nav>
        <address className="not-italic">
          <div className="flex flex-wrap items-center justify-center gap-x-0 gap-y-2 text-xs sm:text-sm text-slate-500 rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm shadow-slate-200/50 px-4 sm:px-6 py-3 sm:py-4">
            <span className="font-semibold text-slate-700">{COMPANY.name}</span>
            {SEP}
            <span>БИН {COMPANY.bin}</span>
            {SEP}
            <span>
              {COMPANY.country}, {COMPANY.region}, {COMPANY.city}
            </span>
            {SEP}
            <span>
              {COMPANY.address}, индекс {COMPANY.postalCode}
            </span>
          </div>
        </address>
      </div>
    </footer>
  );
}
