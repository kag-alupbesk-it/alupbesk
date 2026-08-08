import { getPenagihan } from "@/backend/modules/keuangan";

export async function GET() {
  return Response.json({ success: true, data: getPenagihan() });
}
