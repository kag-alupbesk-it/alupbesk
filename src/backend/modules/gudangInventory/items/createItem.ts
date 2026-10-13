import { gudangCategories } from "../categories/store";
import { gudangInventoryItems, persistInventoryItem } from "./store";
import type {
  GudangInventoryItem,
  GudangInventoryItemInput,
  GudangInventoryResult,
} from "../types";

// Menambah barang baru ke master stok. Stok awal boleh 0.
export function createInventoryItem(
  input: GudangInventoryItemInput,
): GudangInventoryResult<GudangInventoryItem> {
  if (!gudangCategories.has(input.categoryId)) {
    return { ok: false, code: "CATEGORY_NOT_FOUND" };
  }

  const modelNo = (input.modelNo ?? "").trim();
  if (modelNo) {
    const duplicate = [...gudangInventoryItems.values()].some(
      (item) => item.modelNo.toLowerCase() === modelNo.toLowerCase(),
    );
    if (duplicate) return { ok: false, code: "DUPLICATE_MODEL" };
  }

  const now = new Date().toISOString();
  const item: GudangInventoryItem = {
    id: `gi-${crypto.randomUUID()}`,
    categoryId: input.categoryId,
    itemName: input.itemName.trim(),
    brand: (input.brand ?? "").trim(),
    modelNo,
    color: (input.color ?? "").trim(),
    rackGroup: (input.rackGroup ?? "").trim(),
    subRow: (input.subRow ?? "").trim(),
    currentStock: input.currentStock ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  persistInventoryItem(item);
  return { ok: true, data: item };
}
