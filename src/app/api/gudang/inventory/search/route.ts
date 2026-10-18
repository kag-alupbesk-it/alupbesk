import { searchInventoryItems } from "@/backend/modules/gudangInventory/items/search";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET(request: Request) {
  try {
    await ensureHydrated();
  } catch (error) {
    console.error("[API Search] Hydration error:", error);
    return Response.json({ success: false, error: "Gagal memuat data inventaris." }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (query.length < 2) {
    return Response.json({ success: true, data: [] });
  }

  const results = searchInventoryItems(query);
  return Response.json({ success: true, data: results });
}
