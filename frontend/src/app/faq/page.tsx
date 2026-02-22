import { Header } from "@/components/Header";

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-5 py-12">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold">Вопросы и ответы</h1>
          <p className="mt-4 leading-relaxed text-slate-600">Раздел в разработке.</p>
        </div>
      </main>
    </>
  );
}
