import { gudangInventoryItems } from "../items/store";
import { gudangMaterialLots, persistMaterialLot } from "./store";
import { recomputeMaterialStock } from "./recomputeStock";
import { isLotUsable } from "./getLots";
import type { GudangInventoryResult } from "../types";

// Mengambil stok bahan dari lot yang masih terpakai dengan urutan FIFO
// (lot tiba paling awal dipakai lebih dulu). Lot yang habis ditandai "habis",
// lalu stok master dihitung ulang dari sisa lot.
export function consumeMaterialLotsFifo(
  itemId: string,
  quantity: number,
): GudangInventoryResult<number> {
  const item = gudangInventoryItems.get(itemId);
  if (!item) return { ok: false, code: "ITEM_NOT_FOUND" };

  const usable = [...gudangMaterialLots.values()]
    .filter((lot) => lot.itemId === itemId && isLotUsable(lot))
    .sort((left, right) => {
      const byDate = left.receivedDate.localeCompare(right.receivedDate);
      if (byDate !== 0) return byDate;
      return left.createdAt.localeCompare(right.createdAt);
    });

  const available = usable.reduce((sum, lot) => sum + lot.quantity, 0);
  if (available < quantity) return { ok: false, code: "INSUFFICIENT_STOCK" };

  const now = new Date().toISOString();
  let remaining = quantity;
  for (const lot of usable) {
    if (remaining <= 0) break;
    const take = Math.min(lot.quantity, remaining);
    const leftover = lot.quantity - take;
    persistMaterialLot({
      ...lot,
      quantity: leftover,
      status: leftover <= 0 ? "habis" : lot.status,
      updatedAt: now,
    });
    remaining -= take;
  }

  recomputeMaterialStock(itemId);
  return { ok: true, data: quantity };
}
