import AuditLogSection from "@/frontend/shared/audit/AuditLogSection";

export const metadata = { title: "Riwayat Aktivitas | ALUPBESK Owner" };

export default function Page() {
  return <AuditLogSection apiEndpoint="/api/owner/audit" />;
}
