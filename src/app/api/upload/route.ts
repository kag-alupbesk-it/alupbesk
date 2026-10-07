import { db } from "@/services/supabase";
import { ensureStorageBucket } from "@/backend/storage/ensureStorageBucket";

const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = "images";
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_REQUEST_SIZE = MAX_SIZE + 512 * 1024;
const IMAGE_BUCKET_CONFIG = {
  public: true,
  fileSizeLimit: MAX_SIZE,
  allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
};

export async function POST(request: Request) {
  if (!db) {
    return Response.json(
      {
        success: false,
        error: {
          code: "STORAGE_UNAVAILABLE",
          message: "Supabase Storage belum dikonfigurasi.",
        },
      },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return Response.json(
      {
        success: false,
        error: { code: "FILE_TOO_LARGE", message: "Ukuran file maksimal 5 MB." },
      },
      { status: 413 },
    );
  }

  if (!(await ensureStorageBucket(BUCKET, IMAGE_BUCKET_CONFIG))) {
    return Response.json(
      {
        success: false,
        error: {
          code: "BUCKET_FAILED",
          message: "Gagal menyiapkan bucket penyimpanan gambar.",
        },
      },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_FORM", message: "Data form tidak valid." },
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      {
        success: false,
        error: { code: "FILE_REQUIRED", message: "File gambar wajib diunggah." },
      },
      { status: 400 },
    );
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_TYPE", message: "Format yang didukung: JPEG, PNG, WebP, dan GIF." },
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      {
        success: false,
        error: { code: "FILE_TOO_LARGE", message: "Ukuran file maksimal 5 MB." },
      },
      { status: 400 },
    );
  }

  const path = `uploads/${crypto.randomUUID()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return Response.json(
      {
        success: false,
        error: { code: "UPLOAD_FAILED", message: error.message },
      },
      { status: 500 },
    );
  }

  const { data: publicData } = db.storage.from(BUCKET).getPublicUrl(path);

  return Response.json({ success: true, data: { url: publicData.publicUrl } });
}
