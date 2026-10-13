import { gudangInventoryItems, persistInventoryItem } from "../items/store";
import { persistOutTransaction } from "./store";
import type {
  GudangInventoryResult,
  GudangOutTransaction,
  GudangOutTransactionInput,
} from "../types";

// Mencatat barang keluar: stok dikurangi. Transaksi ditolak bila stok kurang
// agar stok master tidak pernah negatif.
export function createOutTransaction(
  input: GudangOutTransactionInput,
): GudangInventoryResult<GudangOutTransaction> {
  const item = gudangInventoryItems.get(input.itemId);
  if (!item) return { ok: false, code: "ITEM_NOT_FOUND" };
  if (item.currentStock < input.quantity) {
    return { ok: false, code: "INSUFFICIENT_STOCK" };
  }

  const now = new Date().toISOString();
  persistInventoryItem({
    ...item,
    currentStock: item.currentStock - input.quantity,
    updatedAt: now,
  });

  const transaction: GudangOutTransaction = {
    id: crypto.randomUUID(),
    transactionDate: input.transactionDate,
    categoryId: item.categoryId,
    itemId: item.id,
    projectId: input.projectId ?? null,
    projectName: (input.projectName ?? "").trim(),
    source: input.source ?? "manual",
    quantity: input.quantity,
    createdBy: input.createdBy,
    createdAt: now,
  };
  persistOutTransaction(transaction);
  return { ok: true, data: transaction };
}
