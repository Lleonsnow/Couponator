"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";

type DocConfig = {
  slug: string;
  title: string;
  ext: "docx" | "pdf";
};

const DOCS: DocConfig[] = [
  { slug: "user-agreement", title: "Пользовательское соглашение", ext: "docx" },
  { slug: "privacy", title: "Политика обработки персональных данных", ext: "docx" },
  { slug: "offer", title: "Публичная оферта", ext: "docx" },
  { slug: "org-card", title: "Карточка организации (PDF)", ext: "pdf" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function AdminDocumentsPage() {
  const [statusBySlug, setStatusBySlug] = useState<Record<string, { status: Status; message: string }>>({});

  async function handleFileChange(slug: string, file: File | null) {
    if (!file) return;

    setStatusBySlug((prev) => ({
      ...prev,
      [slug]: { status: "loading", message: "Загрузка..." },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiUrl(`/api/admin/documents/${slug}`), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        let message = "Не удалось сохранить файл";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        setStatusBySlug((prev) => ({
          ...prev,
          [slug]: { status: "error", message },
        }));
        return;
      }

      setStatusBySlug((prev) => ({
        ...prev,
        [slug]: { status: "success", message: "Файл обновлён" },
      }));
    } catch {
      setStatusBySlug((prev) => ({
        ...prev,
        [slug]: { status: "error", message: "Ошибка сети" },
      }));
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl sm:text-2xl font-extrabold">Документы на сайте</h1>
      <p className="mb-6 text-sm text-slate-500">
        Здесь можно заменить файлы документов, которые доступны пользователям из футера сайта.
      </p>
      <div className="space-y-4">
        {DOCS.map((doc) => {
          const current = statusBySlug[doc.slug] ?? { status: "idle", message: "" };
          return (
            <div
              key={doc.slug}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Допустимый формат файла: <span className="font-semibold uppercase">{doc.ext}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
                  <span>Загрузить файл</span>
                  <input
                    type="file"
                    accept={doc.ext === "pdf" ? "application/pdf" : ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      void handleFileChange(doc.slug, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {current.status !== "idle" && (
                  <p
                    className={`text-xs ${
                      current.status === "success"
                        ? "text-emerald-600"
                        : current.status === "error"
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    {current.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

