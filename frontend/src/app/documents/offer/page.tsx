import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentContent } from "@/components/DocumentContent";
import { apiUrl } from "@/lib/api";

export default function OfferPage() {
  return (
    <DocumentLayout title="Публичная оферта">
      <DocumentContent
        slug="offer"
        downloadUrl={apiUrl("/api/documents/file/offer")}
        downloadLabel="Скачать документ"
      />
    </DocumentLayout>
  );
}
