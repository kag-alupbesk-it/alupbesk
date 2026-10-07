import { getGudangMovements } from "@/backend/modules/gudang";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function GET(request: Request) {
  await ensureHydrated();
  const itemId = new URL(request.url).searchParams.get("itemId") ?? undefined;
  return Response.json({ success: true, data: getGudangMovements(itemId) });
}
