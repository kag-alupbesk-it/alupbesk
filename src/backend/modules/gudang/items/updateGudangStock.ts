import { persistGudangItem, gudangItems } from "./store";
import type { GudangItem } from "./types";

export interface GudangStockInput {
  stok: number;
  minStok: number;
}

// Divisi gudang hanya mengelola stok. Field identitas barang (SKU, merek, dsb.)
// dikelola oleh divisi lain, jadi fungsi ini hanya menimpa nilai stok.
export function updateGudangStock(
  id: string,
  input: GudangStockInput,
): GudangItem | undefined {
  const item = gudangItems.get(id);
  if (!item) return undefined;
  const updated = { ...item, stok: input.stok, minStok: input.minStok };
  persistGudangItem(updated);
  return updated;
}
