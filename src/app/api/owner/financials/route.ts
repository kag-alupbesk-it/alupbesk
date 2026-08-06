import { getFinancialsData } from "@/backend/modules/manager";
export async function GET(request: Request) { const period = new URL(request.url).searchParams.get("period") ?? "monthly"; return Response.json({ success: true, data: getFinancialsData(period) }); }
