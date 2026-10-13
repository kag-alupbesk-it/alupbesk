import { persistProductionRequest, productionRequests } from "./store";
import type { ProductionRequest, ProductionRequestResult } from "./types";

// Menolak pengajuan beserta alasan. Tidak mengubah stok.
export function rejectProductionRequest(
  id: string,
  approvedBy: string,
  reason: string,
): ProductionRequestResult<ProductionRequest> {
  const current = productionRequests.get(id);
  if (!current) return { ok: false, code: "REQUEST_NOT_FOUND" };
  if (current.status !== "diajukan") return { ok: false, code: "REQUEST_STATUS_INVALID" };

  const now = new Date().toISOString();
  const updated: ProductionRequest = {
    ...current,
    status: "ditolak",
    approvedBy,
    approvedAt: now,
    rejectReason: reason.trim(),
    updatedAt: now,
  };
  persistProductionRequest(updated);
  return { ok: true, data: updated };
}
