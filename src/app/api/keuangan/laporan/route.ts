import { getLaporanKeuangan } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET(request: Request) {
  await ensureHydrated();
  const period = new URL(request.url).searchParams.get("period") ?? "monthly";
  const data = getLaporanKeuangan(period);
  await flushWrites();
  return Response.json({ success: true, data });
}
