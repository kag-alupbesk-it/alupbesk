import { gudangInventoryItems } from "../items/store";
import { createOutTransaction } from "../transactions/createOutTransaction";
import { persistProductionRequest, productionRequests } from "./store";
import type { ProductionRequest, ProductionRequestResult } from "./types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Menyetujui pengajuan: stok dipotong otomatis (barang keluar ber-source
// "produksi") dan status naik ke "disetujui". Semua baris divalidasi dulu
// (all-or-nothing) agar tidak ada potongan parsial bila stok kurang.
export function approveProductionRequest(
  id: string,
  approvedBy: string,
): ProductionRequestResult<ProductionRequest> {
  const current = productionRequests.get(id);
  if (!current) return { ok: false, code: "REQUEST_NOT_FOUND" };
  if (current.status !== "diajukan") return { ok: false, code: "REQUEST_STATUS_INVALID" };

  for (const line of current.items) {
    const item = line.itemId ? gudangInventoryItems.get(line.itemId) : undefined;
    if (!item) return { ok: false, code: "ITEM_NOT_FOUND", detail: line.itemName };
    if (item.currentStock < line.quantity) {
      return { ok: false, code: "INSUFFICIENT_STOCK", detail: line.itemName };
    }
  }

  const tanggal = todayIso();
  const projectName = `Produksi - ${current.spkLabel || current.spkRef}`;
  for (const line of current.items) {
    if (!line.itemId) continue;
    createOutTransaction({
      transactionDate: tanggal,
      itemId: line.itemId,
      quantity: line.quantity,
      projectName,
      source: "produksi",
      createdBy: current.requesterName || approvedBy,
    });
  }

  const now = new Date().toISOString();
  const updated: ProductionRequest = {
    ...current,
    status: "disetujui",
    approvedBy,
    approvedAt: now,
    updatedAt: now,
  };
  persistProductionRequest(updated);
  return { ok: true, data: updated };
}
