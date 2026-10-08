import { deleteProjectOrder } from "@/backend/modules/gudang/index";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  const result = deleteProjectOrder(id);
  await flushWrites();
  if (result.ok) return Response.json({ success: true, data: { id } });
  if (result.code === "ORDER_NOT_FOUND")
    return Response.json({ success: false, error: { code: result.code, message: "Pesanan proyek tidak ditemukan." } }, { status: 404 });
  return Response.json({ success: false, error: { code: result.code, message: "Pesanan yang sudah diproses tidak bisa dihapus." } }, { status: 409 });
}
