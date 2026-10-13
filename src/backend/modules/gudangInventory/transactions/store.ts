import { enqueueUpsert } from "@/services/supabase";
import type { GudangInTransaction, GudangOutTransaction } from "../types";

// Riwayat barang masuk & keluar. Diisi dari Supabase saat hydrate dan dari
// pencatatan admin gudang.
export const gudangInTransactions = new Map<string, GudangInTransaction>();
export const gudangOutTransactions = new Map<string, GudangOutTransaction>();

export function persistInTransaction(transaction: GudangInTransaction): void {
  gudangInTransactions.set(transaction.id, transaction);
  enqueueUpsert(
    "gudang_in_transactions",
    {
      id: transaction.id,
      transaction_date: transaction.transactionDate,
      category_id: transaction.categoryId,
      item_id: transaction.itemId,
      quantity: transaction.quantity,
      created_by: transaction.createdBy,
      created_at: transaction.createdAt,
    },
    "id",
  );
}

export function persistOutTransaction(transaction: GudangOutTransaction): void {
  gudangOutTransactions.set(transaction.id, transaction);
  enqueueUpsert(
    "gudang_out_transactions",
    {
      id: transaction.id,
      transaction_date: transaction.transactionDate,
      category_id: transaction.categoryId,
      item_id: transaction.itemId,
      project_id: transaction.projectId,
      project_name: transaction.projectName,
      source: transaction.source,
      quantity: transaction.quantity,
      created_by: transaction.createdBy,
      created_at: transaction.createdAt,
    },
    "id",
  );
}
