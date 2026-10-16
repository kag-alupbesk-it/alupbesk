import {
  createMaterialLot,
  gudangMaterialLots,
  persistMaterialLot,
  recomputeMaterialStock,
} from "@/backend/modules/gudangInventory/lots";
import { pmCutLists, persistCutList } from "./store";
import type {
  ExecuteAllocationInput,
  PMCutAllocation,
  PMCutList,
  PMCutResult,
} from "./types";

// Mengeksekusi daftar potong: mengambil sejumlah potong dari lot bahan,
// mengurangi lot sumber, dan mencatat sisa potong sebagai lot reusable/scrap.
export function executeCutList(
  id: string,
  allocations: ExecuteAllocationInput[],
): PMCutResult<PMCutList> {
  const list = pmCutLists.get(id);
  if (!list) {
    return {
      ok: false,
      code: "CUT_LIST_NOT_FOUND",
      message: "Daftar potong tidak ditemukan.",
    };
  }

  const now = new Date().toISOString();

  for (const input of allocations) {
    const item = list.items.find((entry) => entry.id === input.cutListItemId);
    if (!item) {
      return {
        ok: false,
        code: "CUT_LIST_ITEM_NOT_FOUND",
        message: "Item potong tidak ditemukan pada daftar ini.",
      };
    }

    const lot = gudangMaterialLots.get(input.lotId);
    if (!lot) {
      return {
        ok: false,
        code: "LOT_NOT_FOUND",
        message: "Lot bahan tidak ditemukan.",
      };
    }
    if (lot.quantity < input.quantity) {
      return {
        ok: false,
        code: "INSUFFICIENT_LOT",
        message: `Jumlah lot tersisa tidak mencukupi (tersedia ${lot.quantity}).`,
      };
    }

    const lengthUsed = input.lengthUsed ?? item.length ?? null;
    const remaining = lot.quantity - input.quantity;
    persistMaterialLot({
      ...lot,
      quantity: remaining,
      status: remaining <= 0 ? "habis" : lot.status,
      updatedAt: now,
    });

    const leftoverLength =
      lot.length !== null && lengthUsed !== null && lot.length > lengthUsed
        ? Math.round((lot.length - lengthUsed) * 100) / 100
        : null;

    const allocation: PMCutAllocation = {
      id: `alloc-${crypto.randomUUID()}`,
      cutListItemId: item.id,
      lotId: lot.id,
      quantity: input.quantity,
      lengthUsed,
      leftoverLength,
      leftoverStatus: input.leftoverStatus,
      createdAt: now,
    };
    item.allocations.push(allocation);

    if (leftoverLength !== null && leftoverLength > 0) {
      createMaterialLot({
        itemId: lot.itemId,
        lotCode: lot.lotCode ? `${lot.lotCode}-S` : "",
        length: leftoverLength,
        width: lot.width,
        quantity: input.quantity,
        rackGroup: lot.rackGroup,
        subRow: lot.subRow,
        status: input.leftoverStatus === "reusable" ? "sisa" : "scrap",
        note:
          input.leftoverStatus === "reusable"
            ? `Sisa potong dari ${lot.lotCode || lot.id}`
            : `Scrap dari ${lot.lotCode || lot.id}`,
      });
    }

    recomputeMaterialStock(lot.itemId);
  }

  const allDone = list.items.every((item) => {
    const allocated = item.allocations.reduce(
      (sum, allocation) => sum + allocation.quantity,
      0,
    );
    return allocated >= item.quantity;
  });

  const updated: PMCutList = {
    ...list,
    status: allDone ? "selesai" : "diproses",
    updatedAt: now,
  };
  persistCutList(updated);
  return { ok: true, data: updated };
}
