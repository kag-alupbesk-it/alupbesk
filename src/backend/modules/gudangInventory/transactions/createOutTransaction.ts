import { gudangInventoryItems, persistInventoryItem } from "../items/store";
import { consumeMaterialLotsFifo } from "../lots/consumeLots";
import { persistOutTransaction } from "./store";
import type {
  GudangInventoryResult,
  GudangOutTransaction,
  GudangOutTransactionInput,
} from "../types";

// Mencatat barang keluar. Barang satuan mengurangi `currentStock` langsung.
// Barang bahan mengambil dari lot secara FIFO lalu stok dihitung ulang dari
// sisa lot agar selalu sinkron dengan pelacakan lot.
export function createOutTransaction(
  input: GudangOutTransactionInput,
): GudangInventoryResult<GudangOutTransaction> {
  const item = gudangInventoryItems.get(input.itemId);
  if (!item) return { ok: false, code: "ITEM_NOT_FOUND" };
  if (item.currentStock < input.quantity) {
    return { ok: false, code: "INSUFFICIENT_STOCK" };
  }

  const now = new Date().toISOString();
  if (item.materialKind === "unit") {
    persistInventoryItem({
      ...item,
      currentStock: item.currentStock - input.quantity,
      updatedAt: now,
    });
  } else {
    const consumed = consumeMaterialLotsFifo(item.id, input.quantity);
    if (!consumed.ok) return consumed;
  }

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
