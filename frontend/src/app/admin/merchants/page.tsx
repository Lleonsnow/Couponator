"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Merchant = { id: string; name: string; slug: string };

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/\btoken=([^;]+)/);
  return m ? m[1].trim() : null;
}

export default function AdminMerchantsPage() {
  const [list, setList] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    const token = getToken();
    fetch(apiUrl("/api/merchants"), { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: "include" })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    const token = getToken();
    fetch(apiUrl("/api/merchants"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error((d as { error?: string }).error ?? "Ошибка"); });
        return r.json();
      })
      .then(() => {
        setName("");
        setEmail("");
        setPassword("");
        setShowForm(false);
        load();
      })
      .catch((err: Error) => {
        setSubmitError(err.message ?? "Ошибка");
      })
      .finally(() => setSubmitting(false));
  }

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Партнеры</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90"
          >
            + Добавить мерчанта
          </button>
        )}
      </div>

      {showForm && (
        <div id="sa-merchant-form" className="mb-6 max-w-[500px]">
          <h2 className="mt-0 font-extrabold">Приглашение нового партнера</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Название компании</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email представителя</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3.5"
                minLength={6}
                required
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div className="mt-2 flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Отправка…" : "Отправить"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setSubmitError(""); }}
                className="rounded-lg border border-slate-300 bg-transparent px-5 py-2.5 font-semibold text-slate-500"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[400px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">ID</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Название</th>
              <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500">Slug</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-sm text-slate-500">{m.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-semibold">{m.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{m.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && !showForm && <p className="py-8 text-center text-slate-500">Мерчантов пока нет</p>}
    </div>
  );
}
