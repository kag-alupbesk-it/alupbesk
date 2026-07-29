import type { GudangItem } from "./types";

export function filterItems(
  items: GudangItem[],
  searchQuery: string,
  selectedMerek: string
): GudangItem[] {
  return items.filter((item) => {
    const matchesMerek = selectedMerek === "ALL" || item.merek === selectedMerek;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.sku.toLowerCase().includes(q) ||
      item.jenisBarang.toLowerCase().includes(q) ||
      item.merek.toLowerCase().includes(q) ||
      item.seksiLokasi.toLowerCase().includes(q) ||
      (item.catatan?.toLowerCase().includes(q) ?? false);
    return matchesMerek && matchesSearch;
  });
}

export function computeMetrics(items: GudangItem[]) {
  return {
    totalStok: items.reduce((acc, item) => acc + item.stok, 0),
    jumlahLowStock: items.filter((item) => item.stok <= item.minStok).length,
    daftarMerek: Array.from(new Set(items.map((item) => item.merek))).sort(),
  };
}

export function generateId(): string {
  return `gd-${Date.now()}`;
}
