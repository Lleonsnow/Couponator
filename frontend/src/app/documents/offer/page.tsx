import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentContent } from "@/components/DocumentContent";

export default function OfferPage() {
  return (
    <DocumentLayout title="Публичная оферта">
      <DocumentContent
        slug="offer"
        downloadUrl="/documents/offer.docx"
        downloadLabel="Скачать документ"
      />
    </DocumentLayout>
  );
}
