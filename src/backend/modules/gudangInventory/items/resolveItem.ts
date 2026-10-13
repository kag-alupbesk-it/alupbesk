import { createInventoryItem } from "./createItem";
import { gudangInventoryItems } from "./store";
import type {
  GudangInventoryItem,
  GudangInventoryItemInput,
  GudangInventoryResult,
} from "../types";

// Mencari barang di master stok berdasarkan nomor model (prioritas), lalu
// nama + kategori. Bila belum terdaftar, barang baru dibuat dengan stok awal 0
// sehingga form Barang Masuk/Keluar bisa langsung mengisi detail barang.
export function resolveInventoryItem(
  input: GudangInventoryItemInput,
): GudangInventoryResult<GudangInventoryItem> {
  const modelNo = (input.modelNo ?? "").trim();
  if (modelNo) {
    const byModel = [...gudangInventoryItems.values()].find(
      (item) => item.modelNo.toLowerCase() === modelNo.toLowerCase(),
    );
    if (byModel) return { ok: true, data: byModel };
  }

  const name = input.itemName.trim().toLowerCase();
  const byName = [...gudangInventoryItems.values()].find(
    (item) =>
      item.categoryId === input.categoryId && item.itemName.trim().toLowerCase() === name,
  );
  if (byName) return { ok: true, data: byName };

  return createInventoryItem({ ...input, currentStock: 0 });
}
