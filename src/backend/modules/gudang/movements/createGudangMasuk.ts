import { gudangItems, persistGudangItem } from "../items/store";
import { generateMovementId, persistGudangMovement } from "./store";
import type { GudangItem } from "../items/types";
import type { GudangMovement, GudangMovementResult, MasukInput } from "./types";

// Mencatat barang masuk: stok bertambah otomatis setelah disimpan.
export function createGudangMasuk(
  itemId: string,
  input: MasukInput,
): GudangMovementResult {
  const item = gudangItems.get(itemId);
  if (!item) return { ok: false, code: "GUDANG_ITEM_NOT_FOUND" };

  const stokSebelum = item.stok;
  const stokSesudah = stokSebelum + input.jumlah;

  const updated: GudangItem = { ...item, stok: stokSesudah };
  persistGudangItem(updated);

  const movement: GudangMovement = {
    id: generateMovementId(),
    itemId,
    tipe: "masuk",
    jumlah: input.jumlah,
    tanggal: input.tanggal,
    createdAt: new Date().toISOString(),
    sumber: input.sumber,
    buktiNota: input.buktiNota,
    catatan: input.catatan,
    stokSebelum,
    stokSesudah,
  };
  persistGudangMovement(movement);

  return { ok: true, item: { id: itemId, stok: stokSesudah }, movement };
}
