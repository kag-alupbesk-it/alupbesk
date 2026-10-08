import { ensureStorageBucket } from "@/backend/storage/ensureStorageBucket";

export const TECHNICAL_DRAWINGS_BUCKET = "technical-drawings";
export const MAX_TECHNICAL_DRAWING_SIZE = 50 * 1024 * 1024;

export async function ensureTechnicalDrawingsBucket(): Promise<boolean> {
  return ensureStorageBucket(TECHNICAL_DRAWINGS_BUCKET, {
    public: false,
    fileSizeLimit: MAX_TECHNICAL_DRAWING_SIZE,
    allowedMimeTypes: [
      "application/pdf",
      "application/acad",
      "application/dxf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ],
  });
}
