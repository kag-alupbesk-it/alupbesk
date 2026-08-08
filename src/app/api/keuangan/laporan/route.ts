import { getLaporanKeuangan } from "@/backend/modules/keuangan";

export async function GET(request: Request) {
  const period = new URL(request.url).searchParams.get("period") ?? "monthly";
  return Response.json({ success: true, data: getLaporanKeuangan(period) });
}
