import { db } from "@/services/supabase";
import type { NewPMOrderInput, PMOrder, PMOrderResult } from "./types";
import { generateProductionCode } from "./generateProductionCode";

export async function createPMOrder(
  input: NewPMOrderInput,
): Promise<PMOrderResult> {
  if (!db) {
    return {
      ok: false,
      code: "DATABASE_UNAVAILABLE",
      message: "Database belum dikonfigurasi.",
    };
  }

  const override = input.contractorCode?.trim();
  let productionCode: string;
  if (override) {
    productionCode = override.toUpperCase();
  } else {
    try {
      productionCode = await generateProductionCode({ 
        companyName: input.companyName, 
        kabupaten: input.projectKabupaten 
      });
    } catch (error) {
      console.error("[pm] gagal membuat kode produksi:", error);
      return {
        ok: false,
        code: "DATABASE_ERROR",
        message: "Kode produksi otomatis gagal dibuat.",
      };
    }
  }

  const id = `PM-${new Date().toISOString().slice(2, 7).replace("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const row = {
    id,
    contractor_name: input.contractorName.trim(),
    contractor_code: productionCode,
    contractor_phone: input.contractorPhone?.trim() || null,
    project_address: input.projectAddress?.trim() || null,
    project_province: input.projectProvince?.trim() || null,
    project_kabupaten: input.projectKabupaten?.trim() || null,
    company_name: input.companyName?.trim() || null,
    entered_at: now.slice(0, 10),
    target_date: input.targetDate,
    project_status: "menunggu_acc",
    drawing_status: "menunggu_acc",
    stage: 1,
    production_stage: "pemotongan",
    drawing_variant: "window-frame",
    raw_image: input.rawImage ?? null,
    raw_image_name: input.rawImageName ?? null,
    has_production_drawing: false,
    revision_count: 0,
    last_activity: "Order baru dibuat dan menunggu gambar produksi",
    created_at: now,
    updated_at: now,
  };

  const { error: orderError } = await db.from("pm_orders").insert(row);
  if (orderError) {
    console.error("[pm] gagal menyimpan order:", orderError.message);
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Order gagal disimpan ke database.",
    };
  }

  const itemRows = input.items.map((item, index) => ({
    id: crypto.randomUUID(),
    order_id: id,
    name: item.name.trim(),
    quantity: item.quantity,
    unit: item.unit.trim() || "pcs",
    technical_note: item.technicalNote.trim(),
    sort_order: index,
  }));
  const { error: itemsError } = await db.from("pm_order_items").insert(itemRows);

  if (itemsError) {
    await db.from("pm_orders").delete().eq("id", id);
    console.error("[pm] gagal menyimpan item order:", itemsError.message);
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "Rincian order gagal disimpan.",
    };
  }

  const order: PMOrder = {
    id,
    contractorName: row.contractor_name,
    contractorCode: row.contractor_code,
    contractorPhone: input.contractorPhone,
    projectAddress: input.projectAddress,
    projectProvince: input.projectProvince,
    projectKabupaten: input.projectKabupaten,
    companyName: input.companyName,
    enteredAt: row.entered_at,
    targetDate: row.target_date,
    projectStatus: "menunggu_acc",
    drawingStatus: "menunggu_acc",
    stage: 1,
    productionStage: "pemotongan",
    drawingVariant: "window-frame",
    items: itemRows.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      technicalNote: item.technical_note,
    })),
    rawImage: input.rawImage,
    rawImageName: input.rawImageName,
    hasProductionDrawing: false,
    revisionCount: 0,
    lastActivity: row.last_activity,
  };

  return { ok: true, order };
}
