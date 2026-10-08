import { getGudangItems } from "@/backend/modules/gudang/index";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();
  const items = getGudangItems().filter((item) => item.kategoriBarang === "proyek");
  return Response.json({ success: true, data: items });
}
