import { getLocalOrders } from "@/services/orders";

export async function GET() {
  return Response.json({ success: true, data: getLocalOrders() });
}
