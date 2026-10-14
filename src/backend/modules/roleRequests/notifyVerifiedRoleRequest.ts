import { db } from "@/services/supabase";
import { sendPushToRoles } from "@/services/push/send";

/** Sends the Owner notification once, only after Supabase confirms the email. */
export async function notifyVerifiedRoleRequest(authUserId: string): Promise<void> {
  if (!db) return;
  const { data: request, error } = await db
    .from("role_requests")
    .update({ owner_notified_at: new Date().toISOString() })
    .eq("auth_user_id", authUserId)
    .eq("status", "PENDING")
    .is("owner_notified_at", null)
    .select("profile_id")
    .maybeSingle();
  if (error || !request) return;

  const { data: profile } = await db
    .from("users")
    .select("name, role")
    .eq("id", request.profile_id)
    .maybeSingle();
  if (!profile) return;
  await sendPushToRoles(["owner"], {
    title: "Permintaan akses baru",
    body: `${profile.name} telah memverifikasi email dan meminta akses ${profile.role}.`,
    url: "/admin/owner?tab=users",
  });
}
