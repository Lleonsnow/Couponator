import { Header } from "@/components/Header";

export function DocumentLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-gradient-to-b from-slate-50/80 to-white">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              <div className="mt-3 h-1 w-16 rounded-full bg-primary/80" />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
