"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Profile = { id: string; name: string; slug: string; hasLogo?: boolean };

export default function MerchantProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logoKey, setLogoKey] = useState(0);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/merchant/profile"), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p: Profile) => {
        setProfile(p);
        setName(p.name);
        setSlug(p.slug);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!name.trim()) {
      setSubmitError("Укажите название компании");
      return;
    }
    if (!slug.trim()) {
      setSubmitError("Укажите slug (латиница, цифры, дефис)");
      return;
    }
    setSubmitting(true);
    fetch(apiUrl("/api/merchant/profile"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: name.trim(), slug: slug.trim().toLowerCase() }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => { throw new Error(d.error ?? "Ошибка"); });
        return r.json();
      })
      .then((p: Profile) => {
        setProfile(p);
        setName(p.name);
        setSlug(p.slug);
      })
      .catch((err: Error) => setSubmitError(err.message ?? "Ошибка"))
      .finally(() => setSubmitting(false));
  }

  function handleLogoUpload(file: File | null) {
    if (!file || !profile) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fetch(apiUrl(`/api/merchants/${profile.id}/logo`), {
      method: "POST",
      credentials: "include",
      body: fd,
    })
      .then((r) => { if (!r.ok) return r.json().then((d: { error?: string }) => { throw new Error(d.error); }); setLogoKey((k) => k + 1); setProfile((p) => (p ? { ...p, hasLogo: true } : null)); })
      .catch((err: Error) => alert(err.message ?? "Ошибка загрузки"))
      .finally(() => setLogoUploading(false));
  }

  if (loading) return <p className="text-slate-500">Загрузка...</p>;
  if (!profile) return <p className="text-slate-500">Не удалось загрузить профиль.</p>;

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold">Данные компании</h1>
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <img
            key={logoKey}
            src={profile.hasLogo ? `${apiUrl(`/api/merchants/${profile.id}/logo`)}?t=${logoKey}` : "/placeholder-user.svg"}
            alt=""
            className="h-16 w-16 rounded-full object-cover bg-slate-200"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.onerror = null;
              t.src = "/placeholder-user.svg";
            }}
          />
        </div>
        <div>
          <label className="cursor-pointer inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {logoUploading ? "Загрузка…" : "Загрузить фото партнера"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(ev) => { const f = ev.target.files?.[0]; if (f) handleLogoUpload(f); ev.target.value = ""; }}
              disabled={logoUploading}
            />
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-500">Название компании</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-500">Slug (латиница, цифры, дефис)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-store"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 sm:px-4 py-3 font-mono text-sm"
            pattern="[a-z0-9-]+"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Используется в URL. Только строчные буквы, цифры и дефис.</p>
        </div>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <button type="submit" disabled={submitting} className="rounded-lg bg-primary py-3 px-6 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50">
          {submitting ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
