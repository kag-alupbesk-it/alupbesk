import { getMarketingOrders } from "@/backend/modules/marketing/index";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getMarketingOrders() });
}