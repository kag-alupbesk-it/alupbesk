import { gudangInventoryItems, persistInventoryItem } from "../items/store";
import { persistInTransaction } from "./store";
import type {
  GudangInTransaction,
  GudangInTransactionInput,
  GudangInventoryResult,
} from "../types";

// Mencatat barang masuk: stok master bertambah otomatis setelah disimpan.
export function createInTransaction(
  input: GudangInTransactionInput,
): GudangInventoryResult<GudangInTransaction> {
  const item = gudangInventoryItems.get(input.itemId);
  if (!item) return { ok: false, code: "ITEM_NOT_FOUND" };

  const now = new Date().toISOString();
  persistInventoryItem({
    ...item,
    currentStock: item.currentStock + input.quantity,
    updatedAt: now,
  });

  const transaction: GudangInTransaction = {
    id: crypto.randomUUID(),
    transactionDate: input.transactionDate,
    categoryId: item.categoryId,
    itemId: item.id,
    quantity: input.quantity,
    createdBy: input.createdBy,
    createdAt: now,
  };
  persistInTransaction(transaction);
  return { ok: true, data: transaction };
}
