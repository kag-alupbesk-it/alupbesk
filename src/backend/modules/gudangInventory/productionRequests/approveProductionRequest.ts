import { gudangInventoryItems } from "../items/store";
import { computeItemStockFromLots } from "../lots/getLots";
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

  const requestedByItem = new Map<string, { itemName: string; quantity: number }>();
  for (const line of current.items) {
    const item = line.itemId ? gudangInventoryItems.get(line.itemId) : undefined;
    if (!item) return { ok: false, code: "ITEM_NOT_FOUND", detail: line.itemName };
    const requested = requestedByItem.get(item.id);
    if (requested) {
      requested.quantity += line.quantity;
    } else {
      requestedByItem.set(item.id, { itemName: line.itemName, quantity: line.quantity });
    }
  }

  for (const [itemId, requested] of requestedByItem) {
    const item = gudangInventoryItems.get(itemId);
    if (!item) return { ok: false, code: "ITEM_NOT_FOUND", detail: requested.itemName };
    const available =
      item.materialKind === "unit"
        ? item.currentStock
        : Math.min(item.currentStock, computeItemStockFromLots(itemId));
    if (available < requested.quantity) {
      return { ok: false, code: "INSUFFICIENT_STOCK", detail: requested.itemName };
    }
  }

  const tanggal = todayIso();
  const projectName = `Produksi - ${current.spkLabel || current.spkRef}`;
  for (const [itemId, requested] of requestedByItem) {
    const result = createOutTransaction({
      transactionDate: tanggal,
      itemId,
      quantity: requested.quantity,
      projectName,
      source: "produksi",
      createdBy: current.requesterName || approvedBy,
    });
    if (!result.ok) {
      return {
        ok: false,
        code: result.code === "ITEM_NOT_FOUND" ? "ITEM_NOT_FOUND" : "INSUFFICIENT_STOCK",
        detail: requested.itemName,
      };
    }
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
