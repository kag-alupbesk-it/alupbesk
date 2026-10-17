import { db } from "@/services/supabase";
import { ensureStorageBucket } from "@/backend/storage/ensureStorageBucket";
import { IMAGES_BUCKET, IMAGES_BUCKET_CONFIG } from "@/backend/storage/imagesBucket";
import { checkRateLimit } from "@/backend/http/rateLimit";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

const MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
const MAX_REQUEST_SIZE = MAX_SIZE + 512 * 1024;

// Cek magic-bytes: pastikan isi file benar-benar gambar atau PDF.
function hasValidFileSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/webp") {
    const header = new TextDecoder().decode(bytes.slice(0, 12));
    return header.startsWith("RIFF") && header.slice(8, 12) === "WEBP";
  }
  if (mime === "application/pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF-
  }
  return false;
}

// Upload gambar mentah/PDF form publik Jasa Custom.
export async function POST(request: Request) {
  if (checkRateLimit(request, 20, 60_000).limited) {
    return Response.json({ success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak upload. Coba lagi sebentar lagi." } }, { status: 429 });
  }
  if (!db) {
    return Response.json(
      { success: false, error: { code: "STORAGE_UNAVAILABLE", message: "Supabase Storage belum dikonfigurasi." } },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return Response.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Ukuran file maksimal 5 MB." } }, { status: 413 });
  }

  if (!(await ensureStorageBucket(IMAGES_BUCKET, IMAGES_BUCKET_CONFIG))) {
    return Response.json({ success: false, error: { code: "BUCKET_FAILED", message: "Gagal menyiapkan bucket penyimpanan gambar." } }, { status: 500 });
  }


  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ success: false, error: { code: "INVALID_FORM", message: "Data form tidak valid." } }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ success: false, error: { code: "FILE_REQUIRED", message: "File gambar/PDF wajib diunggah." } }, { status: 400 });
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return Response.json({ success: false, error: { code: "INVALID_TYPE", message: "Format yang didukung: JPEG, PNG, WebP, dan PDF." } }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Ukuran file maksimal 5 MB." } }, { status: 400 });
  }

  const path = `custom/${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  if (!hasValidFileSignature(new Uint8Array(arrayBuffer), file.type)) {
    return Response.json({ success: false, error: { code: "INVALID_FILE", message: "File bukan gambar/PDF yang valid." } }, { status: 400 });
  }

  const { error } = await db.storage.from(IMAGES_BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return Response.json({ success: false, error: { code: "UPLOAD_FAILED", message: error.message } }, { status: 500 });
  }

  const { data: publicData } = db.storage.from(IMAGES_BUCKET).getPublicUrl(path);

  await recordAuditForCurrentUser(
    "UPLOAD",
    "Gambar/Dokumen Jasa Custom",
    `Mengunggah gambar/PDF ${file.name || path} melalui form publik Jasa Custom`,
  );

  return Response.json({ success: true, data: { url: publicData.publicUrl } });
}