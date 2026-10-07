import { db } from "@/services/supabase";
import type { UserItem } from "../types";
import type { AppRole } from "@/backend/auth/roles";

type Input = Pick<UserItem, "name" | "email" | "dept" | "role" | "status">;

export async function updateUser(id: string, input: Input, actorRole: AppRole): Promise<UserItem | null> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  if (actorRole !== "owner") {
    const { data: current, error: readError } = await db
      .from("users")
      .select("role, active")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) return null;
    const changingRole = current.role !== input.role;
    const approvingActivation = !current.active && input.status === "ACTIVE";
    if (
      current.role === "owner" ||
      current.role === "manager" ||
      input.role === "owner" ||
      input.role === "manager" ||
      changingRole ||
      approvingActivation
    ) {
      throw new Error("ROLE_FORBIDDEN");
    }
  }
  const { data, error } = await db
    .from("users")
    .update({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      dept: input.dept.trim(),
      role: input.role,
      status: input.status,
      active: input.status === "ACTIVE",
    })
    .eq("id", id)
    .select("id, name, email, dept, role, status, active")
    .maybeSingle();
  if (error) throw error;
  return data as UserItem | null;
}
