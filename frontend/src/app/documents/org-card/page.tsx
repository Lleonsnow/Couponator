import { DocumentLayout } from "@/components/DocumentLayout";
import { OrgCardPdfViewer } from "./OrgCardPdfViewer";

export default function OrgCardPage() {
  return (
    <DocumentLayout title="Карточка организации">
      <OrgCardPdfViewer />
    </DocumentLayout>
  );
}
