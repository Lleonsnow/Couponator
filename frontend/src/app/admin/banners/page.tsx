"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Banner = { id: string; slot: string; html: string; order: number };

const SLOTS = [{ value: "TOP", label: "Верхний банер" }, { value: "SIDE", label: "Боковой банер" }] as const;

export default function AdminBannersPage() {
  const [list, setList] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slot, setSlot] = useState<"TOP" | "SIDE">("TOP");
  const [html, setHtml] = useState("");
  const [order, setOrder] = useState("0");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    fetch(apiUrl("/api/banners"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(b: Banner) {
    setEditingId(b.id);
    setSlot(b.slot as "TOP" | "SIDE");
    setHtml(b.html);
    setOrder(String(b.order));
    setSubmitError("");
    setShowForm(true);
  }

  function openCreate() {
    setEditingId(null);
    setSlot("TOP");
    setHtml("");
    setOrder("0");
    setSubmitError("");
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const orderNum = parseInt(order, 10);
    if (!html.trim()) {
      setSubmitError("Вставьте HTML-код банера");
      return;
    }
    setSubmitting(true);
    const body = { slot, html: html.trim(), order: isNaN(orderNum) ? 0 : orderNum };
    const url = editingId ? `/api/banners/${editingId}` : "/api/banners";
    const method = editingId ? "PATCH" : "POST";
    fetch(apiUrl(url), {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error((d as { error?: string }).error ?? "Ошибка"); });
        return r.json();
      })
      .then(() => {
        setShowForm(false);
        setEditingId(null);
        load();
      })
      .catch((err: Error) => setSubmitError(err.message ?? "Ошибка"))
      .finally(() => setSubmitting(false));
  }

  function handleDelete(id: string) {
    if (!confirm("Удалить банер?")) return;
    fetch(apiUrl(`/api/banners/${id}`), { method: "DELETE", credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error(); load(); })
      .catch(() => setSubmitError("Не удалось удалить"));
  }

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold">Рекламные банеры</h1>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-primary px-4 py-2.5 sm:px-5 text-sm sm:text-base font-semibold text-white transition hover:bg-primary/90 w-full sm:w-auto min-h-[44px]"
          >
            + Добавить банер
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 max-w-[800px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="border-b border-slate-100 pb-4 text-lg font-extrabold">
            {editingId ? "Редактирование банера" : "Новый банер"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500">Позиция</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as "TOP" | "SIDE")}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3"
              >
                {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">HTML-код (ссылка и картинка)</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm min-h-[120px]"
                placeholder='<a target="_blank" rel="nofollow" href="..."><img width="728" height="90" src="..." alt="..."/></a>'
                maxLength={10000}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500">Порядок (0 = первый)</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                min={0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3"
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {editingId ? "Сохранить" : "Создать"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {SLOTS.map(({ value, label }) => {
          const items = list.filter((b) => b.slot === value);
          return (
            <div key={value} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <h3 className="mb-3 font-semibold text-slate-700">{label}</h3>
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">Нет банеров</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-white p-3">
                      <code className="min-w-0 flex-1 truncate text-xs text-slate-600" title={b.html}>
                        {b.html.slice(0, 80)}…
                      </code>
                      <span className="text-xs text-slate-500 shrink-0">Порядок: {b.order}</span>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => openEdit(b)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Изменить</button>
                        <button type="button" onClick={() => handleDelete(b.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Удалить</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
