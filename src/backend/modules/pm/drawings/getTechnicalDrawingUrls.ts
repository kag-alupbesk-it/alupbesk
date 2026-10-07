import { db } from "@/services/supabase";
import { TECHNICAL_DRAWINGS_BUCKET } from "./ensureTechnicalDrawingsBucket";

export async function getTechnicalDrawingUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (!uniquePaths.length) return new Map();
  if (!db) throw new Error("Database belum dikonfigurasi.");

  const { data, error } = await db.storage
    .from(TECHNICAL_DRAWINGS_BUCKET)
    .createSignedUrls(uniquePaths, 60 * 60);
  if (error) {
    console.error("[pm] gagal membuat tautan gambar teknik:", error.message);
    return new Map();
  }

  const urls = new Map<string, string>();
  for (const entry of data) {
    if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
  }
  return urls;
}
