import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { getNotificationTasks } from "@/backend/modules/notifications/getNotificationTasks";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeCurrentUser("/api/notifications", "GET");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: "AUTH_REQUIRED", message: "Silakan login kembali." } },
      { status: access.status },
    );
  }

  try {
    const data = await getNotificationTasks(access.profile.role);
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { success: false, error: { code: "NOTIFICATIONS_UNAVAILABLE", message: "Notifikasi belum dapat dimuat." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
