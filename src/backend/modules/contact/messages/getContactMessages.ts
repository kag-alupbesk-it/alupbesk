import { db } from "@/services/supabase";
import type { ContactMessage } from "./types";

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data, error } = await db
    .from("contact_messages")
    .select("id, name, email, category, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error("CONTACT_MESSAGES_LOAD_FAILED");

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    category: row.category,
    message: row.message,
    createdAt: row.created_at,
  }));
}
