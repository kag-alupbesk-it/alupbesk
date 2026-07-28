import { getLocalOrder } from "@/services/orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getLocalOrder(id);
  if (!order) {
    return Response.json(
      { success: false, error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." } },
      { status: 404 }
    );
  }
  return Response.json({ success: true, data: { orderId: order.id, status: order.status, updatedAt: order.updatedAt } });
}
