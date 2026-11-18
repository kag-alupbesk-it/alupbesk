import { db } from "@/services/supabase";
import { ensureStorageBucket } from "@/backend/storage/ensureStorageBucket";
import { IMAGES_BUCKET, IMAGES_BUCKET_CONFIG } from "@/backend/storage/imagesBucket";
import { checkRateLimit } from "@/backend/http/rateLimit";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_SIZE + 512 * 1024;

function detectFileFormat(bytes: Uint8Array): { contentType: string; extension: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSignature.every((byte, index) => bytes[index] === byte)) {
    return { contentType: "image/png", extension: "png" };
  }

  if (bytes.length >= 12) {
    const header = new TextDecoder().decode(bytes.slice(0, 12));
    if (header.startsWith("RIFF") && header.slice(8, 12) === "WEBP") {
      return { contentType: "image/webp", extension: "webp" };
    }
  }

  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return { contentType: "application/pdf", extension: "pdf" };
  }

  return null;
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

  if (file.size > MAX_SIZE) {
    return Response.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Ukuran file maksimal 5 MB." } }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const format = detectFileFormat(new Uint8Array(arrayBuffer));
  if (!format) {
    return Response.json({
      success: false,
      error: {
        code: "INVALID_FILE",
        message: "Isi file tidak cocok dengan format JPG, PNG, WEBP, atau PDF. Coba simpan ulang file lalu unggah kembali.",
      },
    }, { status: 400 });
  }

  if (!(await ensureStorageBucket(IMAGES_BUCKET, IMAGES_BUCKET_CONFIG))) {
    return Response.json({ success: false, error: { code: "BUCKET_FAILED", message: "Gagal menyiapkan bucket penyimpanan gambar." } }, { status: 500 });
  }

  const path = `custom/${crypto.randomUUID()}.${format.extension}`;
  const { error } = await db.storage.from(IMAGES_BUCKET).upload(path, arrayBuffer, {
    contentType: format.contentType,
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