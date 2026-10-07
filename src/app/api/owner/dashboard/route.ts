import { getDashboardData } from "@/backend/modules/manager";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function GET(request: Request) {
  await ensureHydrated(); const period = new URL(request.url).searchParams.get("period") ?? "monthly"; return Response.json({ success: true, data: getDashboardData(period) }); }
