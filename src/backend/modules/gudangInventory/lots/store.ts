import { enqueueDelete, enqueueUpsert } from "@/services/supabase";
import type { GudangMaterialLot } from "../types";

// Lot bahan baku: terisi dari Supabase saat hydrate dan dari input gudang.
// Kosong berarti belum ada lot terdaftar.
export const gudangMaterialLots = new Map<string, GudangMaterialLot>();

export function persistMaterialLot(lot: GudangMaterialLot): void {
  gudangMaterialLots.set(lot.id, lot);
  enqueueUpsert(
    "gudang_material_lots",
    {
      id: lot.id,
      item_id: lot.itemId,
      lot_code: lot.lotCode,
      received_date: lot.receivedDate,
      in_transaction_id: lot.inTransactionId,
      length: lot.length,
      width: lot.width,
      quantity: lot.quantity,
      rack_group: lot.rackGroup,
      sub_row: lot.subRow,
      status: lot.status,
      note: lot.note,
      created_at: lot.createdAt,
      updated_at: lot.updatedAt,
    },
    "id",
  );
}

export function removeMaterialLot(id: string): void {
  gudangMaterialLots.delete(id);
  enqueueDelete("gudang_material_lots", "id", id);
}
