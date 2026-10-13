import { db } from "@/services/supabase";
import { ensureStorageBucket } from "@/backend/storage/ensureStorageBucket";
import { checkRateLimit } from "@/backend/http/rateLimit";

const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = "images";
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_REQUEST_SIZE = MAX_SIZE + 512 * 1024;
const IMAGE_BUCKET_CONFIG = {
  public: true,
  fileSizeLimit: MAX_SIZE,
  allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
};

// Cek magic-bytes: nama ekstensi/MIME dari klien dapat dipalsukan, jadi
// pastikan isi file benar-benar gambar. Mencegah file selain gambar (HTML/JS)
// disembunyikan di bucket publik.
function hasValidImageSignature(bytes: Uint8Array, mime: string): boolean {
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
  return false;
}

// Upload gambar mentah form publik Jasa Custom. Tidak butuh login: request
// masuk lewat URL pengguna yang belum terautentikasi.
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

  if (!(await ensureStorageBucket(BUCKET, IMAGE_BUCKET_CONFIG))) {
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
    return Response.json({ success: false, error: { code: "FILE_REQUIRED", message: "File gambar wajib diunggah." } }, { status: 400 });
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return Response.json({ success: false, error: { code: "INVALID_TYPE", message: "Format yang didukung: JPEG, PNG, dan WebP." } }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ success: false, error: { code: "FILE_TOO_LARGE", message: "Ukuran file maksimal 5 MB." } }, { status: 400 });
  }

  const path = `custom/${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();
  if (!hasValidImageSignature(new Uint8Array(arrayBuffer), file.type)) {
    return Response.json({ success: false, error: { code: "INVALID_IMAGE", message: "File bukan gambar yang valid." } }, { status: 400 });
  }

  const { error } = await db.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return Response.json({ success: false, error: { code: "UPLOAD_FAILED", message: error.message } }, { status: 500 });
  }

  const { data: publicData } = db.storage.from(BUCKET).getPublicUrl(path);

  return Response.json({ success: true, data: { url: publicData.publicUrl } });
}