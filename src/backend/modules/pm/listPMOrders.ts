import { db } from "@/services/supabase";
import type { PMItem, PMOrder } from "./types";
import { getTechnicalDrawingUrls } from "./drawings/getTechnicalDrawingUrls";

export async function listPMOrders(): Promise<PMOrder[]> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const { data: rows, error } = await db
    .from("pm_orders")
    .select("*")
    .order("entered_at", { ascending: false });

  if (error) throw error;
  const orderRows = rows ?? [];
  if (orderRows.length === 0) return [];

  const { data: itemRows, error: itemError } = await db
    .from("pm_order_items")
    .select("*")
    .in("order_id", orderRows.map((row) => row.id))
    .order("sort_order");

  if (itemError) throw itemError;

  const drawingUrls = await getTechnicalDrawingUrls(
    orderRows.map((row) => row.production_image).filter(Boolean),
  );

  const itemsByOrder = new Map<string, PMItem[]>();
  for (const row of itemRows ?? []) {
    const items = itemsByOrder.get(row.order_id) ?? [];
    items.push({
      id: row.id,
      name: row.name,
      quantity: Number(row.quantity),
      unit: row.unit,
      technicalNote: row.technical_note,
    });
    itemsByOrder.set(row.order_id, items);
  }

  return orderRows.map((row) => ({
      id: row.id,
      contractorName: row.contractor_name,
      contractorCode: row.contractor_code,
      contractorPhone: row.contractor_phone ?? undefined,
      projectAddress: row.project_address ?? undefined,
      enteredAt: row.entered_at,
      targetDate: row.target_date,
      projectStatus: row.project_status,
      drawingStatus: row.drawing_status,
      stage: row.stage,
      productionStage: row.production_stage,
      drawingVariant: row.drawing_variant,
      items: itemsByOrder.get(row.id) ?? [],
      rawImage: row.raw_image ?? undefined,
      rawImageName: row.raw_image_name ?? undefined,
      technicalNote: row.technical_note ?? undefined,
      productionImage:
        (row.production_image && drawingUrls.get(row.production_image)) ?? undefined,
      productionImageName: row.production_image_name ?? undefined,
      productionImageSize: Number(row.production_image_size) || undefined,
      productionImageType: row.production_image_type ?? undefined,
      hasProductionDrawing: row.has_production_drawing,
      revisionNote: row.revision_note ?? undefined,
      revisionCount: row.revision_count,
      lastActivity: row.last_activity,
    }));
}
