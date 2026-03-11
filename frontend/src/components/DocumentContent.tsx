"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { apiUrl } from "@/lib/api";

export function DocumentContent({
  slug,
  downloadUrl,
  downloadLabel,
}: {
  slug: string;
  downloadUrl: string;
  downloadLabel: string;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(apiUrl(`/api/documents/${slug}`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { html: string }) => setHtml(DOMPurify.sanitize(data.html)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-slate-500">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Загрузка...
      </div>
    );
  }
  if (error || !html) {
    return (
      <p className="py-10 text-center text-slate-500">
        Не удалось загрузить документ.{" "}
        <a href={downloadUrl} className="font-medium text-primary hover:underline" download>
          Скачать файл
        </a>
      </p>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-primary hover:text-white"
          download
        >
          {downloadLabel}
        </a>
      </div>
      <article
        className="document-body text-slate-600 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-[15px] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:pb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_ul]:mt-3 [&_ul]:pl-6 [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-slate-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
