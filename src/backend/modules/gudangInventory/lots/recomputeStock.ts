import { gudangInventoryItems, persistInventoryItem } from "../items/store";
import { computeItemStockFromLots } from "./getLots";

// Menyelaraskan `currentStock` barang bahan dengan total lot yang masih
// terpakai. Barang satuan biasa (material_kind = 'unit') tidak diubah agar
// pencatatan stok manual tetap berlaku.
export function recomputeMaterialStock(itemId: string): void {
  const item = gudangInventoryItems.get(itemId);
  if (!item || item.materialKind === "unit") return;

  const stock = computeItemStockFromLots(itemId);
  if (stock === item.currentStock) return;

  persistInventoryItem({
    ...item,
    currentStock: stock,
    updatedAt: new Date().toISOString(),
  });
}
