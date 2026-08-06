import { getMarketingReport } from "@/backend/modules/marketing";
export async function GET() { return Response.json({ success: true, data: getMarketingReport() }); }
