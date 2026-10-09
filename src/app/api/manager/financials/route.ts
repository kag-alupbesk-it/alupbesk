import { getFinancialsData } from "@/backend/modules/manager/index";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function GET(request: Request) {
  await ensureHydrated(); const url = new URL(request.url); const period = url.searchParams.get("period") ?? "monthly"; const startDate = url.searchParams.get("startDate"); const endDate = url.searchParams.get("endDate"); return Response.json({ success: true, data: getFinancialsData(period, { startDate: startDate || undefined, endDate: endDate || undefined }) }); }
