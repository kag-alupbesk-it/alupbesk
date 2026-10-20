import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { roleCanAccess } from "@/backend/auth/roles";

export default async function DrafterAuditPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect("/admin/login");
  if (!roleCanAccess(profile.role, "/drafter", "GET")) redirect("/admin/app");
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Riwayat Aktivitas - Drafter</h1>
    </main>
  );
}
