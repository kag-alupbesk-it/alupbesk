import { getGudangOrders } from "@/backend/modules/gudang";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function GET() {
  await ensureHydrated(); return Response.json({ success: true, data: getGudangOrders() }); }
