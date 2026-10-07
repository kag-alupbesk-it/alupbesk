import { getPortalConfig } from "@/backend/modules/portal";

export async function GET() {
  return Response.json(
    { success: true, data: getPortalConfig() },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
  );
}
