import { Header } from "@/components/Header";

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-8 sm:py-12">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold">Контакты</h1>
          <p className="mt-4 leading-relaxed text-slate-600">Связь с поддержкой — через форму обратной связи или email.</p>
        </div>
      </main>
    </>
  );
}
