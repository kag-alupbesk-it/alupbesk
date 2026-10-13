import { getProductionRequests } from "@/backend/modules/gudangInventory/productionRequests";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeCurrentUser(
    "/api/gudang/inventory/production-requests",
    "GET",
  );
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses permintaan produksi ditolak.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  return Response.json(
    { success: true, data: getProductionRequests() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
