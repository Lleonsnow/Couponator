import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentContent } from "@/components/DocumentContent";
import { apiUrl } from "@/lib/api";

export default function UserAgreementPage() {
  return (
    <DocumentLayout title="Пользовательское соглашение">
      <DocumentContent
        slug="user-agreement"
        downloadUrl={apiUrl("/api/documents/file/user-agreement")}
        downloadLabel="Скачать документ"
      />
    </DocumentLayout>
  );
}
