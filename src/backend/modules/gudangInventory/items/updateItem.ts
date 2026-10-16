import { gudangCategories } from "../categories/store";
import { gudangInventoryItems, persistInventoryItem } from "./store";
import type {
  GudangInventoryItem,
  GudangInventoryItemInput,
  GudangInventoryResult,
} from "../types";

// Menyunting barang master stok. Field yang tidak dikirim dibiarkan apa adanya.
export function updateInventoryItem(
  id: string,
  input: Partial<GudangInventoryItemInput>,
): GudangInventoryResult<GudangInventoryItem> {
  const existing = gudangInventoryItems.get(id);
  if (!existing) return { ok: false, code: "ITEM_NOT_FOUND" };

  if (input.categoryId && !gudangCategories.has(input.categoryId)) {
    return { ok: false, code: "CATEGORY_NOT_FOUND" };
  }

  const modelNo = input.modelNo !== undefined ? input.modelNo.trim() : existing.modelNo;
  if (input.modelNo !== undefined && modelNo) {
    const duplicate = [...gudangInventoryItems.values()].some(
      (item) =>
        item.id !== id && item.modelNo.toLowerCase() === modelNo.toLowerCase(),
    );
    if (duplicate) return { ok: false, code: "DUPLICATE_MODEL" };
  }

  const updated: GudangInventoryItem = {
    ...existing,
    categoryId: input.categoryId ?? existing.categoryId,
    itemName: input.itemName !== undefined ? input.itemName.trim() : existing.itemName,
    brand: input.brand !== undefined ? input.brand.trim() : existing.brand,
    modelNo,
    color: input.color !== undefined ? input.color.trim() : existing.color,
    rackGroup: input.rackGroup !== undefined ? input.rackGroup.trim() : existing.rackGroup,
    subRow: input.subRow !== undefined ? input.subRow.trim() : existing.subRow,
    currentStock: input.currentStock ?? existing.currentStock,
    unit: input.unit !== undefined ? input.unit.trim() || "pcs" : existing.unit,
    materialKind: input.materialKind ?? existing.materialKind,
    lengthPerUnit:
      input.lengthPerUnit !== undefined ? input.lengthPerUnit : existing.lengthPerUnit,
    widthPerUnit:
      input.widthPerUnit !== undefined ? input.widthPerUnit : existing.widthPerUnit,
    weightPerUnit:
      input.weightPerUnit !== undefined ? input.weightPerUnit : existing.weightPerUnit,
    updatedAt: new Date().toISOString(),
  };
  persistInventoryItem(updated);
  return { ok: true, data: updated };
}
