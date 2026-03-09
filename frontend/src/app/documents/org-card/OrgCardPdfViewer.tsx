const PDF_VIEW_URL = "/api/documents/pdf/org-card";
const PDF_DOWNLOAD_URL = "/documents/org-card.pdf";

export function OrgCardPdfViewer() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 sm:p-10 text-center">
      <p className="mb-6 text-slate-600">
        Документ откроется в просмотрщике PDF вашего браузера.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={PDF_VIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          Открыть документ
        </a>
        <a
          href={PDF_DOWNLOAD_URL}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Скачать PDF
        </a>
      </div>
    </div>
  );
}
