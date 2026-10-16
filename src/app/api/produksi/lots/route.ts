import { getMaterialLotViews } from "@/backend/modules/gudangInventory/lots";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

// Daftar lot bahan (read-only) untuk dipilih divisi produksi saat memotong.
export async function GET() {
  const access = await authorizeCurrentUser("/api/produksi/lots", "GET");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses data lot bahan ditolak.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  return Response.json(
    { success: true, data: getMaterialLotViews() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
