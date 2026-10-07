import { getGudangItems } from "@/backend/modules/gudang";
import type { InventoryData, InventoryItem } from "../types";
import { stockStatus } from "./stockStatus";
import { namaJenis } from "./namaJenis";

export function getInventoryData(): InventoryData {
  const items: InventoryItem[] = getGudangItems().map((item) => ({
    id: item.id,
    sku: item.sku,
    name: `${item.merek} ${namaJenis(item.jenisBarang)}`.trim(),
    variant: item.proyek ?? item.warna ?? item.catatan ?? "",
    category: item.kategoriBarang === "proyek" ? "Proyek" : "Hardware",
    icon: item.kategoriBarang === "proyek" ? "engineering" : item.jenisBarang === "handle" ? "door_front" : "lock_open",
    stock: item.stok,
    threshold: item.minStok,
    status: stockStatus(item.stok, item.minStok),
  }));
  return {
    items,
    filters: ["All Items", ...new Set(items.map((item) => item.category))],
  };
}
