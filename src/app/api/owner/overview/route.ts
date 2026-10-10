import { getOwnerOverview } from "@/backend/modules/owner/index";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureHydrated();
  const period = new URL(request.url).searchParams.get("period") ?? "monthly";
  const data = await getOwnerOverview(period);
  return Response.json({ success: true, data });
}
