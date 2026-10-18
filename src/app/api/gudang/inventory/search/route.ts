import { searchInventoryItems } from "@/backend/modules/gudangInventory/items/search";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET(request: Request) {
  await ensureHydrated();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (query.length < 2) {
    return Response.json({ success: true, data: [] });
  }

  const results = searchInventoryItems(query);
  return Response.json({ success: true, data: results });
}
