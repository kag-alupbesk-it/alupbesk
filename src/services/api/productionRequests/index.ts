import type {
  CreateProductionRequestInput,
  ProductionRequest,
} from "@/backend/modules/gudangInventory/productionRequests";
import type { GudangInventoryItemView } from "@/backend/modules/gudangInventory";
import { request } from "../request";

export type ProductionDecision = "approve" | "reject";

export const productionRequestsApi = {
  // Riwayat pengajuan milik divisi produksi.
  list: (): Promise<ProductionRequest[]> => request("/produksi/permintaan"),
  // Master Stok (read-only) untuk memilih material yang diajukan.
  listMasterItems: (): Promise<GudangInventoryItemView[]> => request("/produksi/items"),
  create: (
    input: CreateProductionRequestInput,
  ): Promise<{ request: ProductionRequest; replaced: boolean }> =>
    request("/produksi/permintaan", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  // Keputusan gudang: setuju (stok terpotong) atau tolak beserta alasan.
  decide: (
    id: string,
    action: ProductionDecision,
    reason?: string,
  ): Promise<ProductionRequest> =>
    request(`/gudang/inventory/production-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action, reason }),
    }),
};
