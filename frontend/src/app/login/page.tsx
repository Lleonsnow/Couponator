"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { apiUrl } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then((r) => r.json())
      .then((u: { role?: string | null }) => {
        if (u?.role === "ADMIN") router.replace("/admin");
        else if (u?.role === "MERCHANT") router.replace("/merchant/coupons");
        else if (u?.role) router.replace("/");
      })
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
      try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Ошибка входа");
        return;
      }
      const role = (data as { user?: { role?: string } }).user?.role;
      const safeFrom = from && from.startsWith("/") && !from.startsWith("//") ? from : null;
      if (role === "ADMIN") {
        router.replace("/admin");
        router.refresh();
        return;
      }
      if (role === "MERCHANT") router.push("/merchant/coupons");
      else if (safeFrom) router.push(safeFrom);
      else router.push("/");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-5 py-12">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-100 bg-white p-8 shadow-md"
      >
        <h1 className="mb-6 text-center text-2xl font-extrabold">Вход</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-primary"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-primary"
          required
        />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover"
        >
          Войти
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link href="/" className="text-primary hover:underline">
            На главную
          </Link>
        </p>
      </form>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center">Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}
