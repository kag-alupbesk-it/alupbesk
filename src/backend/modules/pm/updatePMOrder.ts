import { db } from "@/services/supabase";
import type { PMOrderMutation, PMOrderResult, PMProjectStatus } from "./types";
import type { PMProductionStage } from "@/services/pm/types";
import { getTechnicalDrawingUrls } from "./drawings/getTechnicalDrawingUrls";

const NEXT_STATUS: Partial<Record<PMProjectStatus, PMProjectStatus>> = {
  siap_produksi: "produksi",
  produksi: "siap_kirim",
  siap_kirim: "selesai",
};

const PRODUCTION_STAGES: PMProductionStage[] = [
  "pemotongan",
  "perakitan",
  "finishing",
  "qc",
  "siap_kirim",
];

export async function updatePMOrder(
  id: string,
  mutation: PMOrderMutation,
): Promise<PMOrderResult> {
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
    console.error("[pm] gagal membaca order:", readError.message);
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

  const now = new Date().toISOString();
  let changes: Record<string, unknown>;

  if (mutation.action === "approve") {
    if (current.drawing_status === "acc_gambar" || !current.has_production_drawing) {
      return {
        ok: false,
        code: "INVALID_TRANSITION",
        message: "Order belum memiliki gambar produksi yang menunggu persetujuan.",
      };
    }
    changes = {
      drawing_status: "acc_gambar",
      project_status: "siap_produksi",
      stage: 2,
      revision_note: null,
      last_activity: "ACC gambar diberikan, order siap produksi",
    };
  } else if (mutation.action === "revision") {
    const note = mutation.note.trim();
    if (!note || current.drawing_status === "acc_gambar") {
      return {
        ok: false,
        code: "INVALID_TRANSITION",
        message: "Catatan revisi wajib diisi dan gambar yang sudah di-ACC tidak dapat direvisi.",
      };
    }
    changes = {
      drawing_status: "revisi",
      project_status: "menunggu_acc",
      stage: 1,
      revision_note: note,
      revision_count: Number(current.revision_count) + 1,
      last_activity: "Permintaan revisi dicatat",
    };
  } else if (mutation.action === "advance") {
    const nextStatus = NEXT_STATUS[current.project_status as PMProjectStatus];
    if (!nextStatus || current.drawing_status !== "acc_gambar") {
      return {
        ok: false,
        code: "INVALID_TRANSITION",
        message: "Tahap order tidak dapat dilanjutkan sebelum gambar di-ACC.",
      };
    }
    changes = {
      project_status: nextStatus,
      stage: nextStatus === "produksi" ? 2 : 3,
      last_activity:
        nextStatus === "produksi"
          ? "Produksi dimulai"
          : nextStatus === "siap_kirim"
            ? "Produksi selesai, order siap kirim"
            : "Proyek ditandai selesai",
    };
  } else {
    const currentStage = PRODUCTION_STAGES.indexOf(
      current.production_stage as PMProductionStage,
    );
    const requestedStage = PRODUCTION_STAGES.indexOf(mutation.stage);
    if (
      current.drawing_status !== "acc_gambar" ||
      currentStage < 0 ||
      requestedStage !== currentStage + 1
    ) {
      return {
        ok: false,
        code: "INVALID_TRANSITION",
        message: "Tahap produksi harus dilanjutkan satu langkah setelah gambar di-ACC.",
      };
    }
    changes = {
      production_stage: mutation.stage,
      last_activity: `Tahap produksi ${mutation.stage} dimulai`,
    };
  }

  const { data: changed, error: updateError } = await db
    .from("pm_orders")
    .update({ ...changes, updated_at: now })
    .eq("id", id)
    .eq("project_status", current.project_status)
    .eq("drawing_status", current.drawing_status)
    .eq("production_stage", current.production_stage)
    .eq("updated_at", current.updated_at)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[pm] gagal memperbarui order:", updateError.message);
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Perubahan order gagal disimpan.",
    };
  }
  if (!changed) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "Order sudah berubah. Muat ulang data lalu coba lagi.",
    };
  }

  const { data: updated, error: updatedReadError } = await db
    .from("pm_orders")
    .select("*")
    .eq("id", id)
    .single();
  if (updatedReadError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Perubahan tersimpan, tetapi order gagal dimuat ulang.",
    };
  }

  const { data: items, error: itemsError } = await db
    .from("pm_order_items")
    .select("id, name, quantity, unit, technical_note")
    .eq("order_id", id)
    .order("sort_order");
  if (itemsError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Order tersimpan, tetapi rincian gagal dimuat.",
    };
  }

  const drawingUrls = await getTechnicalDrawingUrls(
    updated.production_image ? [updated.production_image] : [],
  );

  return {
    ok: true,
    order: {
      id: updated.id,
      contractorName: updated.contractor_name,
      contractorCode: updated.contractor_code,
      contractorPhone: updated.contractor_phone ?? undefined,
      projectAddress: updated.project_address ?? undefined,
      enteredAt: updated.entered_at,
      targetDate: updated.target_date,
      projectStatus: updated.project_status,
      drawingStatus: updated.drawing_status,
      stage: updated.stage,
      productionStage: updated.production_stage,
      drawingVariant: updated.drawing_variant,
      items: (items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        technicalNote: item.technical_note,
      })),
      rawImage: updated.raw_image ?? undefined,
      rawImageName: updated.raw_image_name ?? undefined,
      technicalNote: updated.technical_note ?? undefined,
      productionImage: updated.production_image
        ? drawingUrls.get(updated.production_image)
        : undefined,
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
