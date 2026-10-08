import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import type { AppRole } from "@/backend/auth/roles";

const roleStartPage: Record<AppRole, string> = {
  pelanggan: "/catalog",
  marketing: "/admin/marketing",
  gudang: "/admin/gudang",
  keuangan: "/admin/keuangan",
  proyek: "/admin/pm",
  field: "/admin/field",
  produksi: "/admin/produksi",
  manager: "/admin/manager",
  owner: "/admin/owner",
};

export default async function InstalledAppEntryPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect("/admin/login");
  redirect(roleStartPage[profile.role]);
}
