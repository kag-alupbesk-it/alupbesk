import { db } from "@/services/supabase";
import type { AppRole } from "@/backend/auth/roles";
import type { RoleRequest } from "./types";

export async function getRoleRequests(): Promise<RoleRequest[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data: pendingUsers, error } = await db
    .from("users")
    .select("id, name, email, dept, role, created_at")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (pendingUsers ?? []).map((user) => ({
    id: user.id,
    profileId: user.id,
    name: user.name,
    email: user.email ?? "",
    department: user.dept ?? "",
    requestedRole: user.role as AppRole,
    createdAt: user.created_at,
  }));
}
