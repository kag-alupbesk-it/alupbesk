import { gudangInventoryItems } from "../items/store";
import { persistMaterialLot } from "./store";
import { recomputeMaterialStock } from "./recomputeStock";
import type {
  GudangInventoryResult,
  GudangMaterialLot,
  GudangMaterialLotInput,
} from "../types";

// Menambah lot bahan baru. Lot dipakai untuk melacak sisa potong material.
export function createMaterialLot(
  input: GudangMaterialLotInput,
): GudangInventoryResult<GudangMaterialLot> {
  const item = gudangInventoryItems.get(input.itemId);
  if (!item) return { ok: false, code: "ITEM_NOT_FOUND" };

  const now = new Date().toISOString();
  const lot: GudangMaterialLot = {
    id: `lot-${crypto.randomUUID()}`,
    itemId: item.id,
    lotCode: (input.lotCode ?? "").trim(),
    receivedDate: input.receivedDate ?? now.slice(0, 10),
    inTransactionId: input.inTransactionId ?? null,
    length: input.length ?? null,
    width: input.width ?? null,
    quantity: input.quantity ?? 1,
    rackGroup: (input.rackGroup ?? item.rackGroup).trim(),
    subRow: (input.subRow ?? item.subRow).trim(),
    status: input.status ?? "tersedia",
    note: (input.note ?? "").trim(),
    createdAt: now,
    updatedAt: now,
  };
  persistMaterialLot(lot);
  recomputeMaterialStock(item.id);
  return { ok: true, data: lot };
}
