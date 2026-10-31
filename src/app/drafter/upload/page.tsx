import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { roleCanAccess } from "@/backend/auth/roles";
import { DrafterProvider } from "@/frontend/Manager/(drafter)/context/DrafterContext/DrafterContext";
import { DrafterUploadGambarTeknik } from "@/frontend/Manager/(drafter)/components/UploadGambarTeknik/UploadGambarTeknik";

export default async function DrafterUploadPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect("/admin/login");
  if (!roleCanAccess(profile.role, "/drafter", "GET")) redirect("/admin/app");

  return (
    <DrafterProvider>
      <DrafterUploadGambarTeknik />
    </DrafterProvider>
  );
}
