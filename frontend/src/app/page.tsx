import { Header } from "@/components/Header";
import { HomeContent } from "@/components/HomeContent";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-4 sm:px-5 py-4 sm:py-6">
        <HomeContent />
      </main>
    </>
  );
}
