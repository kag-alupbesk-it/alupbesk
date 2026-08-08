import { gudangItems } from "../items/store";
import { generateMovementId, gudangMovements } from "./store";
import type { GudangItem } from "../items/types";
import type { GudangMovement, GudangMovementResult, KeluarInput } from "./types";

// Mencatat barang keluar: stok berkurang otomatis setelah disimpan.
export function createGudangKeluar(
  itemId: string,
  input: KeluarInput,
): GudangMovementResult {
  const item = gudangItems.get(itemId);
  if (!item) return { ok: false, code: "GUDANG_ITEM_NOT_FOUND" };
  if (input.jumlah > item.stok) return { ok: false, code: "GUDANG_STOCK_NOT_ENOUGH" };

  const stokSebelum = item.stok;
  const stokSesudah = stokSebelum - input.jumlah;

  const updated: GudangItem = { ...item, stok: stokSesudah };
  gudangItems.set(itemId, updated);

  const movement: GudangMovement = {
    id: generateMovementId(),
    itemId,
    tipe: "keluar",
    jumlah: input.jumlah,
    tanggal: input.tanggal,
    createdAt: new Date().toISOString(),
    tujuan: input.tujuan,
    penerima: input.penerima,
    catatan: input.catatan,
    stokSebelum,
    stokSesudah,
  };
  gudangMovements.set(movement.id, movement);

  return { ok: true, item: { id: itemId, stok: stokSesudah }, movement };
}
