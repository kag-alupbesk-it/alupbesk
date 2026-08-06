import { getGudangItems } from "@/backend/modules/gudang";
export async function GET() { return Response.json({ success: true, data: await getGudangItems() }); }
