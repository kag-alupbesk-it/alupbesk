import { getDashboardData } from "@/backend/modules/manager/index";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET(request: Request) {
  await ensureHydrated();
  const period = new URL(request.url).searchParams.get("period") ?? "monthly";
  const profile = await getAuthenticatedProfile();
  const data = await getDashboardData(period, profile?.role === "owner");
  return Response.json({ success: true, data });
}
