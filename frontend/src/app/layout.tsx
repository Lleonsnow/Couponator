import type { Metadata } from "next";
import { CityProvider } from "@/context/CityContext";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Купонатор",
  description: "Поиск купонов и промокодов",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        <CityProvider>
          {children}
          <Footer />
        </CityProvider>
      </body>
    </html>
  );
}
