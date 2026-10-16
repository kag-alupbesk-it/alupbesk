import { gudangInventoryItems } from "../items/store";
import { gudangMaterialLots, persistMaterialLot } from "./store";
import { recomputeMaterialStock } from "./recomputeStock";
import type {
  GudangInventoryResult,
  GudangMaterialLot,
  GudangMaterialLotInput,
} from "../types";

// Menyunting lot bahan. Field yang tidak dikirim dibiarkan apa adanya.
export function updateMaterialLot(
  id: string,
  input: Partial<GudangMaterialLotInput>,
): GudangInventoryResult<GudangMaterialLot> {
  const existing = gudangMaterialLots.get(id);
  if (!existing) return { ok: false, code: "LOT_NOT_FOUND" };

  if (input.itemId && !gudangInventoryItems.has(input.itemId)) {
    return { ok: false, code: "ITEM_NOT_FOUND" };
  }

  const updated: GudangMaterialLot = {
    ...existing,
    itemId: input.itemId ?? existing.itemId,
    lotCode: input.lotCode !== undefined ? input.lotCode.trim() : existing.lotCode,
    receivedDate: input.receivedDate ?? existing.receivedDate,
    length: input.length !== undefined ? input.length : existing.length,
    width: input.width !== undefined ? input.width : existing.width,
    quantity: input.quantity ?? existing.quantity,
    rackGroup: input.rackGroup !== undefined ? input.rackGroup.trim() : existing.rackGroup,
    subRow: input.subRow !== undefined ? input.subRow.trim() : existing.subRow,
    status: input.status ?? existing.status,
    note: input.note !== undefined ? input.note.trim() : existing.note,
    updatedAt: new Date().toISOString(),
  };
  persistMaterialLot(updated);
  recomputeMaterialStock(updated.itemId);
  if (existing.itemId !== updated.itemId) recomputeMaterialStock(existing.itemId);
  return { ok: true, data: updated };
}
