import type { Metadata } from "next";
import { CityProvider } from "@/context/CityContext";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Купонатор",
  description: "Поиск купонов и промокодов",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%234f46e5' rx='4'/%3E%3Ctext x='16' y='22' font-size='18' text-anchor='middle' fill='white'%3E%F0%9F%8E%9F%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        <CityProvider>
          <PageTransition>{children}</PageTransition>
          <Footer />
        </CityProvider>
      </body>
    </html>
  );
}
