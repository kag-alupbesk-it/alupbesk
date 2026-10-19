import { enqueueDelete } from "@/services/supabase";
import { gudangInventoryItems } from "./store";
import { gudangInTransactions, gudangOutTransactions } from "../transactions/store";
import { gudangMaterialLots, removeMaterialLot } from "../lots/store";
import type { GudangInventoryResult } from "../types";

// Menghapus barang beserta riwayat masuk/keluar di memori. Di Supabase,
// relasi `on delete cascade` pada item_id ikut menghapus riwayatnya.
export function deleteInventoryItem(
  id: string,
): GudangInventoryResult<{ id: string }> {
  if (!gudangInventoryItems.has(id)) return { ok: false, code: "ITEM_NOT_FOUND" };

  gudangInventoryItems.delete(id);

  for (const [trxId, trx] of gudangInTransactions) {
    if (trx.itemId === id) {
      gudangInTransactions.delete(trxId);
      enqueueDelete("gudang_in_transactions", "id", trxId);
    }
  }
  for (const [trxId, trx] of gudangOutTransactions) {
    if (trx.itemId === id) {
      gudangOutTransactions.delete(trxId);
      enqueueDelete("gudang_out_transactions", "id", trxId);
    }
  }
  for (const [lotId, lot] of gudangMaterialLots) {
    if (lot.itemId === id) removeMaterialLot(lotId);
  }

  enqueueDelete("gudang_inventory_items", "id", id);
  return { ok: true, data: { id } };
}
