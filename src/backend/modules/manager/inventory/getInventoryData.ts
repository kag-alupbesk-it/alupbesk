import { getGudangItems } from "@/backend/modules/gudang";
import type { InventoryData, InventoryItem } from "../types";

function stockStatus(stock: number, threshold: number): string {
  if (stock <= 0) return "Out of Stock";
  if (stock < threshold) return "Critical";
  return "Healthy";
}

function namaJenis(jenisBarang: string): string {
  if (jenisBarang === "handle") return "Handle";
  if (jenisBarang === "mortise") return "Mortise Lock";
  return jenisBarang.charAt(0).toUpperCase() + jenisBarang.slice(1);
}

export function getInventoryData(): InventoryData {
  const items: InventoryItem[] = getGudangItems().map((item) => ({
    sku: item.sku,
    name: `${item.merek} ${namaJenis(item.jenisBarang)}`,
    variant: item.proyek ?? item.warna,
    category: item.kategoriBarang === "proyek" ? "Proyek" : "Hardware",
    icon: item.kategoriBarang === "proyek" ? "engineering" : item.jenisBarang === "handle" ? "door_front" : "lock_open",
    stock: item.stok,
    threshold: item.minStok,
    status: stockStatus(item.stok, item.minStok),
  }));
  return { items, filters: ["All Items", "Hardware", "Proyek"] };
}
