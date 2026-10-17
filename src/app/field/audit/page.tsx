import AuditLogSection from "@/frontend/shared/audit/AuditLogSection";

export const metadata = { title: "Riwayat Aktivitas | ALUPBESK Field" };

export default function Page() {
  return (
    <AuditLogSection
      apiEndpoint="/api/field/audit"
      description="Catatan aktivitas yang dilakukan oleh role Field (Pengiriman)."
    />
  );
}
