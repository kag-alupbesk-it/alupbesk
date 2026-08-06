import type { GudangItem } from "@/backend/modules/gudang";
import { request } from "../request";
export interface GudangStockInput { stok: number; minStok: number; }
export const gudangApi = { getItems: (): Promise<GudangItem[]> => request("/gudang/items"), updateStock: (id: string, input: GudangStockInput): Promise<GudangItem> => request(`/gudang/items/${id}`, { method: "PUT", body: JSON.stringify(input) }) };
