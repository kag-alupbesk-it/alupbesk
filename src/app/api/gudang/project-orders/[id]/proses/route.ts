import { prosesProjectOrder } from "@/backend/modules/gudang";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = prosesProjectOrder(id);
  if (result.ok) return Response.json({ success: true, data: result });
  if (result.code === "ORDER_NOT_FOUND")
    return Response.json({ success: false, error: { code: result.code, message: "Pesanan proyek tidak ditemukan." } }, { status: 404 });
  if (result.code === "STOCK_NOT_ENOUGH")
    return Response.json({ success: false, error: { code: result.code, message: "Stok gudang tidak cukup untuk pesanan proyek ini." } }, { status: 422 });
  return Response.json({ success: false, error: { code: result.code, message: "Pesanan proyek belum bisa diproses." } }, { status: 400 });
}
