import { getInventoryItemViews } from "@/backend/modules/gudangInventory/items";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

// Daftar Master Stok untuk dipilih divisi produksi saat mengajukan material.
export async function GET() {
  const access = await authorizeCurrentUser("/api/produksi/items", "GET");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses Master Stok ditolak.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  return Response.json(
    { success: true, data: getInventoryItemViews() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
