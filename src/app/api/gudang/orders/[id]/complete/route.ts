import { completeGudangOrder } from "@/backend/modules/gudang";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = completeGudangOrder(id);
  if (result.ok) return Response.json({ success: true, data: result });
  if (result.code === "ORDER_NOT_FOUND") return Response.json({ success: false, error: { code: result.code, message: "Pesanan tidak ditemukan." } }, { status: 404 });
  return Response.json({ success: false, error: { code: result.code, message: "Pesanan belum bisa ditandai selesai." } }, { status: 400 });
}
