import { db } from "@/services/supabase";
import type { AppRole } from "@/backend/auth/roles";
import type { RoleRequest } from "./types";

const requestableRoles = new Set<AppRole>([
  "marketing", "gudang", "keuangan", "proyek", "field", "produksi",
]);

function isDuplicateKey(error: { code?: string } | null) {
  return error?.code === "23505";
}

/**
 * Loads the pending queue and repairs legacy pending profiles that were
 * created before their matching role_requests row existed.
 */
export async function getRoleRequests(): Promise<RoleRequest[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data: pendingUsers, error: usersError } = await db
    .from("users")
    .select("id, name, email, dept, role, created_at, email_confirmed_at")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });
  if (usersError) throw usersError;

  const users = (pendingUsers ?? []).filter((user) =>
    requestableRoles.has(user.role as AppRole),
  );
  const { data: existingRequests, error: requestsError } = await db
    .from("role_requests")
    .select("id, auth_user_id, profile_id, requested_role, created_at")
    .eq("status", "PENDING");
  if (requestsError) throw requestsError;

  const requestedProfiles = new Set((existingRequests ?? []).map((item) => item.profile_id));
  const usersToRepair = users.filter((user) => !requestedProfiles.has(user.id));
  for (const user of usersToRepair) {
    const { data: authResult, error: authError } = await db.auth.admin.getUserById(user.id);
    if (authError || !authResult.user) continue;
    const { error: insertError } = await db.from("role_requests").insert({
      auth_user_id: user.id,
      profile_id: user.id,
      requested_role: user.role,
    });
    if (insertError && !isDuplicateKey(insertError)) throw insertError;
  }

  const profileIds = [...new Set([
    ...users.map((user) => user.id),
    ...(existingRequests ?? []).map((request) => request.profile_id),
  ])];
  if (profileIds.length === 0) return [];

  const { data: pendingRequests, error: finalRequestsError } = await db
    .from("role_requests")
    .select("id, auth_user_id, profile_id, requested_role, created_at")
    .eq("status", "PENDING")
    .in("profile_id", profileIds)
    .order("created_at", { ascending: true });
  if (finalRequestsError) throw finalRequestsError;

  const { data: profiles, error: profilesError } = await db
    .from("users")
    .select("id, name, email, dept, role, created_at, email_confirmed_at, active, status")
    .in("id", profileIds);
  if (profilesError) throw profilesError;

  const profilesById = new Map((profiles ?? []).map((user) => [user.id, user]));
  // A PENDING request is the source of truth; fail closed if an older trigger
  // accidentally left its profile active.
  const activePendingIds = (pendingRequests ?? [])
    .map((request) => profilesById.get(request.profile_id))
    .filter((user) => user?.active)
    .map((user) => user!.id);
  if (activePendingIds.length > 0) {
    const { error: deactivateError } = await db
      .from("users")
      .update({ active: false, status: "PENDING" })
      .in("id", activePendingIds);
    if (deactivateError) throw deactivateError;
  }

  return (pendingRequests ?? []).flatMap((request) => {
    const user = profilesById.get(request.profile_id);
    if (!user) return [];
    return [{
      id: request.id,
      profileId: request.profile_id,
      name: user.name,
      email: user.email ?? "",
      department: user.dept ?? "",
      requestedRole: request.requested_role as AppRole,
      createdAt: request.created_at,
      emailVerified: Boolean(user.email_confirmed_at),
    }];
  });
}
