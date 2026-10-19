import type {
  GudangCategory,
  GudangInTransaction,
  GudangInTransactionView,
  GudangInventoryItem,
  GudangInventoryItemInput,
  GudangMaterialLot,
  GudangMaterialLotInput,
  GudangMaterialLotView,
  GudangOutTransaction,
  GudangOutTransactionView,
} from "@/backend/modules/gudangInventory";
import type { ImportSummary } from "@/backend/modules/gudangInventory/excel";
import type { ProductionRequest } from "@/backend/modules/gudangInventory/productionRequests";
import { getApiBaseUrl, request } from "../request";

export interface InventorySnapshot {
  categories: GudangCategory[];
  items: GudangInventoryItem[];
  inTransactions: GudangInTransactionView[];
  outTransactions: GudangOutTransactionView[];
  productionRequests: ProductionRequest[];
  materialLots: GudangMaterialLotView[];
}

export interface InventoryItemRef {
  categoryId: string;
  itemName: string;
  brand?: string;
  modelNo?: string;
  color?: string;
  rackGroup?: string;
  subRow?: string;
  unit?: string;
  materialKind?: GudangInventoryItem["materialKind"];
  lengthPerUnit?: number | null;
  widthPerUnit?: number | null;
  weightPerUnit?: number | null;
}

export interface InventoryLotInput {
  length?: number | null;
  width?: number | null;
  quantity: number;
  rackGroup?: string;
  subRow?: string;
  lotCode?: string;
}

export interface InventoryInInput extends InventoryItemRef {
  transactionDate: string;
  quantity: number;
  lots?: InventoryLotInput[];
  createdBy?: string;
}

export interface InventoryOutInput extends InventoryItemRef {
  transactionDate: string;
  quantity: number;
  projectId?: string | null;
  projectName?: string;
  createdBy?: string;
}

export type InventoryExportType = "items" | "in" | "out";

export const gudangInventoryApi = {
  getSnapshot: (): Promise<InventorySnapshot> => request("/gudang/inventory"),
  listItems: (): Promise<GudangInventoryItem[]> => request("/gudang/inventory/items"),
  createItem: (input: GudangInventoryItemInput): Promise<GudangInventoryItem> =>
    request("/gudang/inventory/items", { method: "POST", body: JSON.stringify(input) }),
  updateItem: (
    id: string,
    input: Partial<GudangInventoryItemInput>,
  ): Promise<GudangInventoryItem> =>
    request(`/gudang/inventory/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteItem: (id: string): Promise<{ id: string }> =>
    request(`/gudang/inventory/items/${id}`, { method: "DELETE" }),
  listMaterialLots: (): Promise<GudangMaterialLotView[]> =>
    request("/gudang/inventory/lots"),
  createMaterialLot: (
    input: GudangMaterialLotInput,
  ): Promise<GudangMaterialLot> =>
    request("/gudang/inventory/lots", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateMaterialLot: (
    id: string,
    input: Partial<GudangMaterialLotInput>,
  ): Promise<GudangMaterialLot> =>
    request(`/gudang/inventory/lots/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteMaterialLot: (id: string): Promise<{ id: string }> =>
    request(`/gudang/inventory/lots/${id}`, { method: "DELETE" }),
  listCategories: (): Promise<GudangCategory[]> =>
    request("/gudang/inventory/categories"),
  createCategory: (name: string): Promise<GudangCategory> =>
    request("/gudang/inventory/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  createIn: (input: InventoryInInput): Promise<GudangInTransaction> =>
    request("/gudang/inventory/transactions", {
      method: "POST",
      body: JSON.stringify({ type: "in", ...input }),
    }),
  createOut: (input: InventoryOutInput): Promise<GudangOutTransaction> =>
    request("/gudang/inventory/transactions", {
      method: "POST",
      body: JSON.stringify({ type: "out", ...input }),
    }),
  importWorkbook: (file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/gudang/inventory/import", { method: "POST", body: formData });
  },
  exportUrl: (type: InventoryExportType): string =>
    `${getApiBaseUrl()}/gudang/inventory/export?type=${type}`,
};
