import { db } from "@/services/supabase";
import type { UserItem, UsersData } from "../types";

export async function getUsersData(): Promise<UsersData> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data, error } = await db
    .from("users")
    .select("id, name, email, dept, role, status, active")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return {
    users: (data ?? []).map((row): UserItem => ({
      id: row.id,
      name: row.name,
      email: row.email ?? "",
      dept: row.dept ?? "",
      role: row.role,
      status: row.status,
      active: row.active,
    })),
  };
}
