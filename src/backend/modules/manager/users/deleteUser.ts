import { db } from "@/services/supabase";
import type { AppRole } from "@/backend/auth/roles";

export async function deleteUser(id: string, actorRole: AppRole): Promise<boolean> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  if (actorRole !== "owner") {
    const { data: current, error: readError } = await db
      .from("users")
      .select("role")
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) return false;
    if (current.role === "owner" || current.role === "manager") throw new Error("ROLE_FORBIDDEN");
  }
  const { data, error } = await db
    .from("users")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (data) {
    // Hapus juga kredensial Auth agar tidak meninggalkan profil yatim yang
    // memblokir pendaftaran ulang dengan email yang sama.
    const { error: authError } = await db.auth.admin.deleteUser(id);
    if (authError) {
      console.error(`[deleteUser] hapus auth user ${id} gagal:`, authError);
    }
  }
  return Boolean(data);
}
