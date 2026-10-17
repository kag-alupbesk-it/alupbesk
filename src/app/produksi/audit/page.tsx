import AuditLogSection from "@/frontend/shared/audit/AuditLogSection";

export const metadata = { title: "Riwayat Aktivitas | ALUPBESK Produksi" };

export default function Page() {
  return (
    <AuditLogSection
      apiEndpoint="/api/produksi/audit"
      description="Catatan aktivitas yang dilakukan oleh role Produksi."
    />
  );
}
