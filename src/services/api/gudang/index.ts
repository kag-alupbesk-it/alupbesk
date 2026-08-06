import type { GudangItem, GudangItemInput } from "@/backend/modules/gudang";
import { request } from "../request";
export const gudangApi = { getItems: (): Promise<GudangItem[]> => request("/gudang/items"), createItem: (input: GudangItemInput): Promise<GudangItem> => request("/gudang/items", { method: "POST", body: JSON.stringify(input) }), updateItem: (id: string, input: GudangItemInput): Promise<GudangItem> => request(`/gudang/items/${id}`, { method: "PUT", body: JSON.stringify(input) }), deleteItem: (id: string): Promise<void> => request(`/gudang/items/${id}`, { method: "DELETE" }) };
