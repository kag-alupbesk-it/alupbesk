import { request } from "@/services/api/request";

export interface InventoryItem {
  sku: string;
  name: string;
  variant: string;
  category: string;
  icon: string;
  stock: number;
  threshold: number;
  status: string;
}

export interface InventoryData {
  items: InventoryItem[];
  filters: string[];
}

export function fetchInventoryData(): Promise<InventoryData> {
  return request<InventoryData>("/owner/inventory");
}
