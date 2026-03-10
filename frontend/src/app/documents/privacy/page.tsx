import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentContent } from "@/components/DocumentContent";
import { apiUrl } from "@/lib/api";

export default function PrivacyPage() {
  return (
    <DocumentLayout title="Политика обработки персональных данных">
      <DocumentContent
        slug="privacy"
        downloadUrl={apiUrl("/api/documents/file/privacy")}
        downloadLabel="Скачать документ"
      />
    </DocumentLayout>
  );
}
