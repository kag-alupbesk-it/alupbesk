import { getCatalogProducts } from "@/services/catalog";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getCatalogProducts() });
}
