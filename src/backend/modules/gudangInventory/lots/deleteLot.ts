import { gudangMaterialLots, removeMaterialLot } from "./store";
import { recomputeMaterialStock } from "./recomputeStock";
import type { GudangInventoryResult } from "../types";

export function deleteMaterialLot(
  id: string,
): GudangInventoryResult<{ id: string }> {
  const existing = gudangMaterialLots.get(id);
  if (!existing) return { ok: false, code: "LOT_NOT_FOUND" };

  removeMaterialLot(id);
  recomputeMaterialStock(existing.itemId);
  return { ok: true, data: { id } };
}
