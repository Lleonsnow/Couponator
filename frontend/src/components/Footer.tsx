import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-[var(--container)] px-5">
        <nav className="mb-6 flex flex-wrap justify-center gap-8">
          <Link href="/about" className="font-medium text-slate-500 transition hover:text-primary">
            О компании
          </Link>
          <Link href="/contacts" className="font-medium text-slate-500 transition hover:text-primary">
            Контакты
          </Link>
          <Link href="/faq" className="font-medium text-slate-500 transition hover:text-primary">
            Вопросы и ответы
          </Link>
          <Link href="/terms" className="font-medium text-slate-500 transition hover:text-primary">
            Пользовательское соглашение
          </Link>
          <Link href="/merchants" className="font-medium text-slate-500 transition hover:text-primary">
            Мерчантам
          </Link>
        </nav>
        <p className="text-center text-sm text-slate-400">
          © 2026 Купонатор. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
