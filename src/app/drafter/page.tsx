import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { roleCanAccess } from "@/backend/auth/roles";

export default async function DrafterDashboardPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect("/admin/login");
  if (!roleCanAccess(profile.role, "/drafter", "GET")) redirect("/admin/app");
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard Drafter</h1>
      <p>Halaman drafter siap. Tugas desain akan muncul di sini.</p>
    </main>
  );
}
