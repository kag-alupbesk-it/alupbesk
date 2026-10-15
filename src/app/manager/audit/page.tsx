import AuditLogSection from "@/frontend/shared/audit/AuditLogSection";

export const metadata = { title: "Riwayat Aktivitas | ALUPBESK Manager" };

export default function Page() {
  return <AuditLogSection apiEndpoint="/api/manager/audit" />;
}
