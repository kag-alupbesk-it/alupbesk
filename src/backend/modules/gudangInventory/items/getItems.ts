import { gudangInventoryItems } from "./store";
import { getCategoryById } from "../categories/getCategories";
import type { GudangInventoryItem, GudangInventoryItemView } from "../types";

export function getInventoryItems(): GudangInventoryItem[] {
  return [...gudangInventoryItems.values()].sort((left, right) => {
    const byCategory = left.categoryId.localeCompare(right.categoryId);
    if (byCategory !== 0) return byCategory;
    const byRack = left.rackGroup.localeCompare(right.rackGroup, "id");
    if (byRack !== 0) return byRack;
    return left.itemName.localeCompare(right.itemName, "id");
  });
}

// Master Stok lengkap dengan nama kategori untuk kebutuhan tampilan pemilih.
export function getInventoryItemViews(): GudangInventoryItemView[] {
  return getInventoryItems().map((item) => ({
    ...item,
    categoryName: getCategoryById(item.categoryId)?.name ?? "",
  }));
}

export function getInventoryItemById(id: string): GudangInventoryItem | undefined {
  return gudangInventoryItems.get(id);
}
