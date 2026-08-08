import { getLocalOrder, publishOrderStatus } from "@/services/orders";
import type { GudangOrderResult } from "./types";
import { computeOrderSegment } from "./segment";

// Menandai pesanan yang sudah dikirim dari gudang sebagai selesai.
export function completeGudangOrder(id: string): GudangOrderResult {
  const current = getLocalOrder(id);
  if (!current) return { ok: false, code: "ORDER_NOT_FOUND" };
  if (current.status !== "processing")
    return { ok: false, code: "ORDER_STATUS_INVALID" };

  const updated = publishOrderStatus(id, "completed");
  if (!updated) return { ok: false, code: "ORDER_NOT_FOUND" };

  return {
    ok: true,
    order: { ...updated, status: "completed", processedAt: updated.updatedAt, segmen: computeOrderSegment(updated) },
  };
}
