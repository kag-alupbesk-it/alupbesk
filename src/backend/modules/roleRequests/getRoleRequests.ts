import { db } from "@/services/supabase";
import type { RoleRequest } from "./types";

export async function getRoleRequests(): Promise<RoleRequest[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data: requests, error: requestError } = await db
    .from("role_requests")
    .select("id, profile_id, requested_role, created_at")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });
  if (requestError) throw requestError;
  if (!requests?.length) return [];

  const profileIds = requests.map((request) => request.profile_id);
  const { data: profiles, error: profileError } = await db
    .from("users")
    .select("id, name, email, dept")
    .in("id", profileIds);
  if (profileError) throw profileError;

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return requests.flatMap((request): RoleRequest[] => {
    const profile = profileById.get(request.profile_id);
    if (!profile) return [];
    return [{
      id: request.id,
      profileId: request.profile_id,
      name: profile.name,
      email: profile.email ?? "",
      department: profile.dept ?? "",
      requestedRole: request.requested_role,
      createdAt: request.created_at,
    }];
  });
}
