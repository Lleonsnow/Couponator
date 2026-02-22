import { Header } from "@/components/Header";
import { HomeContent } from "@/components/HomeContent";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[var(--container)] px-5 py-4">
        <HomeContent />
      </main>
    </>
  );
}
