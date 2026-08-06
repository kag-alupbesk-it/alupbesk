import { getGudangItems } from "@/backend/modules/gudang";
import type { InventoryData, InventoryItem } from "../types";

function stockStatus(stock: number, threshold: number): string {
  if (stock <= 0) return "Out of Stock";
  if (stock < threshold) return "Critical";
  return "Healthy";
}

export function getInventoryData(): InventoryData {
  const items: InventoryItem[] = getGudangItems().map((item) => ({
    sku: item.sku,
    name: `${item.merek} ${item.jenisBarang === "handle" ? "Handle" : "Mortise Lock"}`,
    variant: item.warna,
    category: "Hardware",
    icon: item.jenisBarang === "handle" ? "door_front" : "lock_open",
    stock: item.stok,
    threshold: item.minStok,
    status: stockStatus(item.stok, item.minStok),
  }));
  return { items, filters: ["All Items", "Hardware"] };
}
