import { db } from "@/services/supabase";
import { TECHNICAL_DRAWINGS_BUCKET } from "./ensureTechnicalDrawingsBucket";

export async function deleteTechnicalDrawing(path: string): Promise<void> {
  if (!db) return;
  try {
    const { error } = await db.storage
      .from(TECHNICAL_DRAWINGS_BUCKET)
      .remove([path]);
    if (error) {
      console.error("[pm] gagal membersihkan file gambar:", error.message);
    }
  } catch (error) {
    console.error("[pm] gagal membersihkan file gambar:", error);
  }
}
