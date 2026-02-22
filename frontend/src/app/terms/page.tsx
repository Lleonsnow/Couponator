import { Header } from "@/components/Header";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-5 py-12">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold">Пользовательское соглашение</h1>
          <p className="mt-4 leading-relaxed text-slate-600">Условия использования платформы Купонатор.</p>
        </div>
      </main>
    </>
  );
}
