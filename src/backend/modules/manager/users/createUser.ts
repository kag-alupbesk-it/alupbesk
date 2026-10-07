import { db } from "@/services/supabase";
import type { AppRole } from "@/backend/auth/roles";
import type { UserItem } from "../types";

type Input = Pick<UserItem, "name" | "email" | "dept" | "role">;

export async function createUser(input: Input, actorRole: AppRole): Promise<UserItem> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  if (actorRole !== "owner" && (input.role === "owner" || input.role === "manager")) {
    throw new Error("ROLE_FORBIDDEN");
  }
  const { data, error } = await db
    .from("users")
    .insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      dept: input.dept.trim(),
      role: input.role,
      status: "PENDING",
      active: false,
    })
    .select("id, name, email, dept, role, status, active")
    .single();
  if (error) throw error;
  return data as UserItem;
}
