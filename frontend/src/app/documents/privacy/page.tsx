import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentContent } from "@/components/DocumentContent";

export default function PrivacyPage() {
  return (
    <DocumentLayout title="Политика обработки персональных данных">
      <DocumentContent
        slug="privacy"
        downloadUrl="/documents/privacy.docx"
        downloadLabel="Скачать документ"
      />
    </DocumentLayout>
  );
}
