import { getInventoryData } from "@/backend/modules/manager/index";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function GET() {
  await ensureHydrated(); return Response.json({ success: true, data: getInventoryData() }); }
