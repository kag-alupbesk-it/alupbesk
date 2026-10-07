import { db } from "@/services/supabase";
import type { ContactMessage, ContactMessageInput } from "./types";

export async function createContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessage> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data, error } = await db
    .from("contact_messages")
    .insert({
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      category: input.category.trim(),
      message: input.message.trim(),
    })
    .select("id, name, email, category, message, created_at")
    .single();

  if (error || !data) {
    console.error("[contact] pesan gagal disimpan:", error?.message);
    throw new Error("CONTACT_MESSAGE_SAVE_FAILED");
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email ?? undefined,
    category: data.category,
    message: data.message,
    createdAt: data.created_at,
  };
}
