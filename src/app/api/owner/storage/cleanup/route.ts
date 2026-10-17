import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { checkRateLimit } from "@/backend/http/rateLimit";
import { cleanupOrphanCustomImages } from "@/backend/storage/cleanupOrphanCustomImages";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

export async function POST(request: Request) {
  if (checkRateLimit(request, 1, 60 * 60_000).limited) {
    return Response.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
  }
  const access = await authorizeCurrentUser("/api/owner/storage/cleanup", "POST");
  if (!access.profile) {
    return Response.json({ success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN" } }, { status: access.status });
  }
  if (access.profile.role !== "owner") {
    return Response.json({ success: false, error: { code: "ROLE_FORBIDDEN" } }, { status: 403 });
  }
  try {
    const deleted = await cleanupOrphanCustomImages();
    recordAudit(access.profile, "DELETE", "Pembersihan Storage", `Membersihkan ${deleted} file orphan di storage`);
    return Response.json({ success: true, data: { deleted } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ success: false, error: { code: "CLEANUP_FAILED", message: "Pembersihan file gagal." } }, { status: 500 });
  }
}
