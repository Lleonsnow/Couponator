import { DocumentLayout } from "@/components/DocumentLayout";
import { DocumentContent } from "@/components/DocumentContent";

export default function UserAgreementPage() {
  return (
    <DocumentLayout title="Пользовательское соглашение">
      <DocumentContent
        slug="user-agreement"
        downloadUrl="/documents/user-agreement.docx"
        downloadLabel="Скачать документ"
      />
    </DocumentLayout>
  );
}
