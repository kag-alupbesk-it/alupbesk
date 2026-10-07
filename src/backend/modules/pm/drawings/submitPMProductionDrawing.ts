import { db } from "@/services/supabase";
import { getTechnicalDrawingUrls } from "./getTechnicalDrawingUrls";
import { deleteTechnicalDrawing } from "./deleteTechnicalDrawing";
import type { PMOrder, PMProductionStage } from "../types";

type SubmitDrawingResult =
  | { ok: true; order: PMOrder }
  | {
      ok: false;
      code: "DATABASE_UNAVAILABLE" | "ORDER_NOT_FOUND" | "INVALID_TRANSITION" | "DATABASE_ERROR";
      message: string;
    };

export async function submitPMProductionDrawing(
  id: string,
  path: string,
  fileName: string,
  fileSize: number,
  contentType: string,
  technicalNote: string,
): Promise<SubmitDrawingResult> {
  if (!db) {
    return {
      ok: false,
      code: "DATABASE_UNAVAILABLE",
      message: "Database belum dikonfigurasi.",
    };
  }

  const { data: current, error: readError } = await db
    .from("pm_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("[pm] gagal membaca order untuk unggahan:", readError.message);
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Order gagal dibaca dari database.",
    };
  }
  if (!current) {
    return {
      ok: false,
      code: "ORDER_NOT_FOUND",
      message: "Order tidak ditemukan.",
    };
  }
  if (current.project_status === "selesai") {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "Gambar tidak dapat diubah untuk order yang sudah selesai.",
    };
  }

  const now = new Date().toISOString();
  const { data: changed, error: updateError } = await db
    .from("pm_orders")
    .update({
      production_image: path,
      production_image_name: fileName,
      production_image_size: fileSize,
      production_image_type: contentType,
      technical_note: technicalNote.trim() || null,
      has_production_drawing: true,
      drawing_status: "menunggu_acc",
      project_status: "menunggu_acc",
      stage: 1,
      last_activity: "Gambar teknik dikirim ke PM untuk ditinjau",
      updated_at: now,
    })
    .eq("id", id)
    .eq("updated_at", current.updated_at)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[pm] gagal menyimpan gambar teknik:", updateError.message);
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Gambar teknik gagal disimpan.",
    };
  }
  if (!changed) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "Order sudah berubah. Muat ulang data lalu coba lagi.",
    };
  }
  if (
    current.production_image &&
    !String(current.production_image).startsWith("http")
  ) {
    await deleteTechnicalDrawing(current.production_image);
  }

  const [{ data: updated, error: updatedError }, { data: itemRows, error: itemsError }] =
    await Promise.all([
      db.from("pm_orders").select("*").eq("id", id).single(),
      db
        .from("pm_order_items")
        .select("id, name, quantity, unit, technical_note")
        .eq("order_id", id)
        .order("sort_order"),
    ]);

  if (updatedError || itemsError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Gambar tersimpan, tetapi data order gagal dimuat ulang.",
    };
  }

  const signedUrls = await getTechnicalDrawingUrls(
    updated.production_image ? [updated.production_image] : [],
  );
  const signedUrl = updated.production_image
    ? signedUrls.get(updated.production_image)
    : undefined;
  return {
    ok: true,
    order: {
      id: updated.id,
      contractorName: updated.contractor_name,
      contractorCode: updated.contractor_code,
      enteredAt: updated.entered_at,
      targetDate: updated.target_date,
      projectStatus: updated.project_status,
      drawingStatus: updated.drawing_status,
      stage: updated.stage,
      productionStage: updated.production_stage as PMProductionStage,
      drawingVariant: updated.drawing_variant,
      items: (itemRows ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        technicalNote: item.technical_note,
      })),
      rawImage: updated.raw_image ?? undefined,
      rawImageName: updated.raw_image_name ?? undefined,
      technicalNote: updated.technical_note ?? undefined,
      productionImage: signedUrl,
      productionImageName: updated.production_image_name ?? undefined,
      productionImageSize: Number(updated.production_image_size) || undefined,
      productionImageType: updated.production_image_type ?? undefined,
      hasProductionDrawing: updated.has_production_drawing,
      revisionNote: updated.revision_note ?? undefined,
      revisionCount: updated.revision_count,
      lastActivity: updated.last_activity,
    },
  };
}
