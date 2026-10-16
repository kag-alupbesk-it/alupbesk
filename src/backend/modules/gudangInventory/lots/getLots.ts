import { gudangInventoryItems } from "../items/store";
import { getCategoryById } from "../categories/getCategories";
import { gudangMaterialLots } from "./store";
import type { GudangMaterialLot, GudangMaterialLotView } from "../types";

// Status lot yang dihitung sebagai stok terpakai.
const USABLE_STATUSES = new Set(["tersedia", "sisa"]);

export function getMaterialLots(): GudangMaterialLot[] {
  return [...gudangMaterialLots.values()].sort((left, right) => {
    const byDate = right.receivedDate.localeCompare(left.receivedDate);
    if (byDate !== 0) return byDate;
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function getMaterialLotsByItem(itemId: string): GudangMaterialLot[] {
  return getMaterialLots().filter((lot) => lot.itemId === itemId);
}

export function getMaterialLotById(id: string): GudangMaterialLot | undefined {
  return gudangMaterialLots.get(id);
}

export function isLotUsable(lot: GudangMaterialLot): boolean {
  return USABLE_STATUSES.has(lot.status);
}

// Total stok bahan dari lot yang masih terpakai. Dipakai untuk menyinkronkan
// `currentStock` barang bahan (material_kind != 'unit').
export function computeItemStockFromLots(itemId: string): number {
  return getMaterialLotsByItem(itemId)
    .filter(isLotUsable)
    .reduce((sum, lot) => sum + lot.quantity, 0);
}

export function getMaterialLotViews(): GudangMaterialLotView[] {
  return getMaterialLots().map((lot) => {
    const item = gudangInventoryItems.get(lot.itemId);
    return {
      ...lot,
      itemName: item?.itemName ?? "(barang dihapus)",
      modelNo: item?.modelNo ?? "",
      categoryId: item?.categoryId ?? "",
      categoryName: item ? getCategoryById(item.categoryId)?.name ?? "" : "",
      unit: item?.unit ?? "pcs",
      materialKind: item?.materialKind ?? "unit",
    };
  });
}
