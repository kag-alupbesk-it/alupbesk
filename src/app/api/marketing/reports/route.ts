import { getMarketingReport } from "@/backend/modules/pemasaran";
export async function GET() { return Response.json({ success: true, data: getMarketingReport() }); }
