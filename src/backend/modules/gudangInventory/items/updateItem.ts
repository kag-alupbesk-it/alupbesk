import { gudangCategories } from "../categories/store";
import { gudangInventoryItems, persistInventoryItem } from "./store";
import { gudangMaterialLots } from "../lots/store";
import { recomputeMaterialStock } from "../lots/recomputeStock";
import type {
  GudangInventoryItem,
  GudangInventoryItemInput,
  GudangInventoryResult,
} from "../types";

// Menyunting barang master stok. Field yang tidak dikirim dibiarkan apa adanya.
// Jenis bahan tidak boleh diubah saat barang sudah punya stok/lot, dan stok
// barang bahan selalu diturunkan dari lot (input.currentStock diabaikan).
export function updateInventoryItem(
  id: string,
  input: Partial<GudangInventoryItemInput>,
): GudangInventoryResult<GudangInventoryItem> {
  const existing = gudangInventoryItems.get(id);
  if (!existing) return { ok: false, code: "ITEM_NOT_FOUND" };

  if (input.categoryId && !gudangCategories.has(input.categoryId)) {
    return { ok: false, code: "CATEGORY_NOT_FOUND" };
  }

  const nextMaterialKind = input.materialKind ?? existing.materialKind;
  const materialKindChanged = nextMaterialKind !== existing.materialKind;
  if (materialKindChanged) {
    const hasLots = [...gudangMaterialLots.values()].some((lot) => lot.itemId === id);
    if (hasLots || existing.currentStock > 0) {
      return { ok: false, code: "MATERIAL_KIND_LOCKED" };
    }
  }
  const nextCurrentStock =
    existing.materialKind === "unit"
      ? input.currentStock ?? existing.currentStock
      : existing.currentStock;

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
    currentStock: nextCurrentStock,
    unit: input.unit !== undefined ? input.unit.trim() || "pcs" : existing.unit,
    materialKind: nextMaterialKind,
    lengthPerUnit:
      input.lengthPerUnit !== undefined ? input.lengthPerUnit : existing.lengthPerUnit,
    widthPerUnit:
      input.widthPerUnit !== undefined ? input.widthPerUnit : existing.widthPerUnit,
    weightPerUnit:
      input.weightPerUnit !== undefined ? input.weightPerUnit : existing.weightPerUnit,
    thickness:
      input.thickness !== undefined ? input.thickness : existing.thickness,
    glassType:
      input.glassType !== undefined ? input.glassType : existing.glassType,
    updatedAt: new Date().toISOString(),
  };
  persistInventoryItem(updated);
  if (nextMaterialKind !== "unit") recomputeMaterialStock(id);
  return { ok: true, data: updated };
}
