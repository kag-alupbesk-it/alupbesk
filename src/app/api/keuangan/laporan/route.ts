import { getLaporanKeuangan } from "@/backend/modules/keuangan/index";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET(request: Request) {
  await ensureHydrated();
  const url = new URL(request.url);
  const period = url.searchParams.get("period") ?? "monthly";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const data = getLaporanKeuangan(period, { startDate: startDate || undefined, endDate: endDate || undefined });
  await flushWrites();
  return Response.json({ success: true, data });
}
