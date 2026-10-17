import { fetchAuditLogsForRole } from "@/backend/modules/audit/auditStore";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeCurrentUser("/api/marketing/audit", "GET");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Akses ditolak." } },
      { status: access.status },
    );
  }
  const logs = await fetchAuditLogsForRole(access.profile.role);
  return Response.json({ success: true, data: logs });
}
