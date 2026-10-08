import { processGudangOrder } from "@/backend/modules/gudang/index";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  const result = processGudangOrder(id);
  await flushWrites();
  if (result.ok) return Response.json({ success: true, data: result });
  if (result.code === "ORDER_NOT_FOUND") return Response.json({ success: false, error: { code: result.code, message: "Pesanan tidak ditemukan." } }, { status: 404 });
  if (result.code === "STOCK_NOT_ENOUGH") return Response.json({ success: false, error: { code: result.code, message: "Stok gudang tidak cukup untuk pesanan ini." } }, { status: 422 });
  return Response.json({ success: false, error: { code: result.code, message: "Pesanan belum bisa diproses gudang." } }, { status: 400 });
}
