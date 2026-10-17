import AuditLogSection from "@/frontend/shared/audit/AuditLogSection";

export const metadata = { title: "Riwayat Aktivitas | ALUPBESK Proyek" };

export default function Page() {
  return (
    <AuditLogSection
      apiEndpoint="/api/pm/audit"
      description="Catatan aktivitas yang dilakukan oleh role Project Manager (Proyek)."
    />
  );
}
