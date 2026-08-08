import { getGudangOrders } from "@/backend/modules/gudang";
export async function GET() { return Response.json({ success: true, data: getGudangOrders() }); }
