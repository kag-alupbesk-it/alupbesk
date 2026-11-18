import AuditLogSection from "@/frontend/shared/audit/AuditLogSection";

export const metadata = { title: "Riwayat Aktivitas | ALUPBESK Marketing" };

export default function Page() {
  return (
    <AuditLogSection
      apiEndpoint="/api/marketing/audit"
      descriptionKey="marketingAuditDescription"
    />
  );
}
