import {
  deleteTechnicalDrawing,
  MAX_TECHNICAL_DRAWING_SIZE,
  submitPMProductionDrawing,
  uploadTechnicalDrawing,
} from "@/backend/modules/pm";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser("/api/pm/orders/[id]/drawing", "POST");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Hanya role produksi yang dapat mengunggah gambar teknik.",
        },
      },
      { status: access.status },
    );
  }
  const { id } = await params;
  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_TECHNICAL_DRAWING_SIZE + 512 * 1024
  ) {
    return Response.json(
      {
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "Ukuran gambar teknik maksimal 50 MB.",
        },
      },
      { status: 413 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_FORM", message: "Data unggahan tidak valid." },
      },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const noteValue = form.get("technicalNote");
  const technicalNote = typeof noteValue === "string" ? noteValue.trim() : "";
  if (!(file instanceof File)) {
    return Response.json(
      {
        success: false,
        error: { code: "FILE_REQUIRED", message: "Pilih gambar teknik untuk diunggah." },
      },
      { status: 400 },
    );
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf", "dwg", "dxf", "png", "jpg", "jpeg", "webp"].includes(extension)) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_TYPE",
          message: "Gunakan PDF, DWG, DXF, PNG, JPG, atau WEBP.",
        },
      },
      { status: 400 },
    );
  }
  if (file.size <= 0 || file.size > MAX_TECHNICAL_DRAWING_SIZE) {
    return Response.json(
      {
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "Ukuran gambar teknik maksimal 50 MB.",
        },
      },
      { status: 400 },
    );
  }
  if (technicalNote.length > 4000) {
    return Response.json(
      {
        success: false,
        error: { code: "NOTE_TOO_LONG", message: "Catatan teknis maksimal 4.000 karakter." },
      },
      { status: 400 },
    );
  }

  const uploaded = await uploadTechnicalDrawing(id, file);
  if (!uploaded.ok) {
    const unavailable = uploaded.message.includes("belum dikonfigurasi");
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "UPLOAD_FAILED",
          message: uploaded.message,
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }

  const result = await submitPMProductionDrawing(
    id,
    uploaded.path,
    file.name,
    file.size,
    file.type || "application/octet-stream",
    technicalNote,
  );
  if (!result.ok) {
    await deleteTechnicalDrawing(uploaded.path);
    const status =
      result.code === "DATABASE_UNAVAILABLE"
        ? 503
        : result.code === "ORDER_NOT_FOUND"
          ? 404
          : result.code === "INVALID_TRANSITION"
            ? 409
            : 500;
    return Response.json(
      {
        success: false,
        error: { code: result.code, message: result.message },
      },
      { status },
    );
  }

  return Response.json(
    { success: true, data: result.order },
    { headers: { "Cache-Control": "no-store" } },
  );
}
