import { request } from "@/services/api/request";
import type {
  CreateCutListInput,
  ExecuteAllocationInput,
  PMCutList,
  UpdateCutListInput,
} from "@/backend/modules/pm/cutting";
import type {
  GudangInventoryItemView,
  GudangMaterialLotView,
} from "@/backend/modules/gudangInventory";

export function getCutLists(orderId?: string): Promise<PMCutList[]> {
  const query = orderId ? `?orderId=${encodeURIComponent(orderId)}` : "";
  return request(`/pm/cutting-lists${query}`);
}

export function createCutList(input: CreateCutListInput): Promise<PMCutList> {
  return request("/pm/cutting-lists", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCutList(
  id: string,
  input: UpdateCutListInput,
): Promise<PMCutList> {
  return request(`/pm/cutting-lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCutList(id: string): Promise<{ id: string }> {
  return request(`/pm/cutting-lists/${id}`, { method: "DELETE" });
}

export function executeCutList(
  id: string,
  allocations: ExecuteAllocationInput[],
): Promise<PMCutList> {
  return request(`/pm/cutting-lists/${id}/execute`, {
    method: "POST",
    body: JSON.stringify({ allocations }),
  });
}

// Referensi bahan untuk divisi produksi (hanya baca).
export function listCuttingMaterials(): Promise<GudangInventoryItemView[]> {
  return request("/produksi/items");
}

export function listCuttingLots(): Promise<GudangMaterialLotView[]> {
  return request("/produksi/lots");
}

export const cuttingApi = {
  list: getCutLists,
  create: createCutList,
  update: updateCutList,
  remove: deleteCutList,
  execute: executeCutList,
  listMaterials: listCuttingMaterials,
  listLots: listCuttingLots,
};
