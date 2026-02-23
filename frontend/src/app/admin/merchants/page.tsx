"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Merchant = { id: string; name: string; slug: string };

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => CYRILLIC_TO_LATIN[c] ?? (c >= "а" && c <= "я" ? "" : c))
    .join("");
}

function slugify(name: string): string {
  const transliterated = transliterate(name);
  return transliterated
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    || "";
}

export default function AdminMerchantsPage() {
  const [list, setList] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    fetch(apiUrl("/api/merchants"), { credentials: "include" })
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
    fetch(apiUrl("/api/merchants"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, slug: slug.trim() || undefined }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error((d as { error?: string }).error ?? "Ошибка"); });
        return r.json();
      })
      .then(() => {
        setName("");
        setSlug("");
        setSlugTouched(false);
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
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold">Партнеры</h1>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-primary px-4 py-2.5 sm:px-5 text-sm sm:text-base font-semibold text-white transition hover:bg-primary/90 w-full sm:w-auto min-h-[44px]"
          >
            + Добавить мерчанта
          </button>
        )}
      </div>

      {showForm && (
        <div id="sa-merchant-form" className="mb-4 sm:mb-6 max-w-full sm:max-w-[500px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
          <h2 className="mt-0 text-lg sm:text-xl font-extrabold">Приглашение нового партнера</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-semibold">Название компании</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  if (!slugTouched) setSlug(slugify(v));
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 sm:px-4 sm:py-3.5 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="url-slug"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 sm:px-4 sm:py-3.5 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email представителя</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 sm:px-4 sm:py-3.5 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 sm:px-4 sm:py-3.5 text-base"
                minLength={6}
                required
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 min-h-[44px]"
              >
                {submitting ? "Отправка…" : "Отправить"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setSubmitError(""); }}
                className="rounded-lg border border-slate-300 bg-transparent px-4 py-2.5 font-semibold text-slate-500 min-h-[44px]"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200">
        <table className="w-full min-w-[320px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">ID</th>
              <th className="border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Название</th>
              <th className="border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-500">Slug</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-500">{m.id.slice(0, 8)}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-semibold">{m.name}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-600 truncate max-w-[100px] sm:max-w-none">{m.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && !showForm && <p className="py-8 text-center text-slate-500">Мерчантов пока нет</p>}
    </div>
  );
}
