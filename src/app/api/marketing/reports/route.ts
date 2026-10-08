import { getMarketingReport } from "@/backend/modules/marketing/index";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function GET() {
  await ensureHydrated(); return Response.json({ success: true, data: getMarketingReport() }); }
