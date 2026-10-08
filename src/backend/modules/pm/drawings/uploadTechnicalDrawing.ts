import { db } from "@/services/supabase";
import {
  ensureTechnicalDrawingsBucket,
  TECHNICAL_DRAWINGS_BUCKET,
} from "./ensureTechnicalDrawingsBucket";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  dwg: "application/acad",
  dxf: "application/dxf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function uploadTechnicalDrawing(
  orderId: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  if (!db) return { ok: false, message: "Database belum dikonfigurasi." };
  if (!(await ensureTechnicalDrawingsBucket())) {
    return { ok: false, message: "Bucket gambar teknik belum tersedia." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return { ok: false, message: "Gunakan PDF, DWG, DXF, PNG, JPG, atau WEBP." };
  }

  const path = `pm/${encodeURIComponent(orderId)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await db.storage
    .from(TECHNICAL_DRAWINGS_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("[pm] unggah gambar teknik gagal:", error.message);
    return { ok: false, message: "Gambar teknik gagal diunggah." };
  }

  return { ok: true, path };
}
