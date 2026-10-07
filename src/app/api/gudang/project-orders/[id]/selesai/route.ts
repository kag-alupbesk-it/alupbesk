import { selesaiProjectOrder } from "@/backend/modules/gudang";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  const result = selesaiProjectOrder(id);
  await flushWrites();
  if (result.ok) return Response.json({ success: true, data: result });
  if (result.code === "ORDER_NOT_FOUND")
    return Response.json({ success: false, error: { code: result.code, message: "Pesanan proyek tidak ditemukan." } }, { status: 404 });
  return Response.json({ success: false, error: { code: result.code, message: "Pesanan proyek belum bisa ditandai selesai." } }, { status: 400 });
}
