import { getGudangMovements } from "@/backend/modules/gudang";
export async function GET(request: Request) {
  const itemId = new URL(request.url).searchParams.get("itemId") ?? undefined;
  return Response.json({ success: true, data: getGudangMovements(itemId) });
}
