import { db } from "@/services/supabase";

const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = "images";
let bucketEnsured = false;

async function ensureBucket(): Promise<boolean> {
  if (!db) return false;
  if (bucketEnsured) return true;
  const { error } = await db.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_SIZE,
  });
  bucketEnsured = error === null || error.message.toLowerCase().includes("already exists");
  return bucketEnsured;
}

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

  if (!(await ensureBucket())) {
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

  if (!file.type.startsWith("image/")) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_TYPE", message: "Hanya file gambar yang diperbolehkan." },
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

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
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
