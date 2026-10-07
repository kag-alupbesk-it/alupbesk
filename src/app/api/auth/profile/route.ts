import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { getAccountApprovalStatus } from "@/backend/auth/getAccountApprovalStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      const status = await getAccountApprovalStatus();
      if (status === "PENDING") {
        return Response.json(
          { success: false, error: { code: "ACCOUNT_PENDING", message: "Akun menunggu persetujuan role dari Owner." } },
          { status: 403 },
        );
      }
      if (status === "SUSPENDED") {
        return Response.json(
          { success: false, error: { code: "ACCOUNT_SUSPENDED", message: "Akun tidak aktif. Hubungi Owner." } },
          { status: 403 },
        );
      }
      return Response.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Sesi login tidak aktif." } },
        { status: 401 },
      );
    }
    return Response.json(
      { success: true, data: profile },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { success: false, error: { code: "AUTH_ERROR", message: "Profil akun gagal dimuat." } },
      { status: 500 },
    );
  }
}
