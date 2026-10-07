import { getPenagihan } from "@/backend/modules/keuangan";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getPenagihan() });
}
