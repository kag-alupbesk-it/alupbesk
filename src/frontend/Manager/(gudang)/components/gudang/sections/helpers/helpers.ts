import type { GudangItem, GudangMovement } from "../types/types";

export function filterItems(
  items: GudangItem[],
  searchQuery: string,
  selectedMerek: string,
  selectedKategori = "ALL",
  selectedProyek = "ALL"
): GudangItem[] {
  return items.filter((item) => {
    const matchesMerek = selectedMerek === "ALL" || item.merek === selectedMerek;
    const matchesKategori = selectedKategori === "ALL" || item.kategoriBarang === selectedKategori;
    const matchesProyek = selectedProyek === "ALL" || item.proyek === selectedProyek;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.sku.toLowerCase().includes(q) ||
      item.jenisBarang.toLowerCase().includes(q) ||
      item.kategoriBarang.toLowerCase().includes(q) ||
      item.merek.toLowerCase().includes(q) ||
      item.seksiLokasi.toLowerCase().includes(q) ||
      (item.proyek?.toLowerCase().includes(q) ?? false) ||
      (item.catatan?.toLowerCase().includes(q) ?? false);
    return matchesMerek && matchesKategori && matchesProyek && matchesSearch;
  });
}

export function computeMetrics(items: GudangItem[]) {
  const stokPerProyek = new Map<string, { stok: number; jumlahItem: number; jumlahLowStock: number }>();
  for (const item of items) {
    if (item.kategoriBarang !== "proyek" || !item.proyek) continue;
    const entry = stokPerProyek.get(item.proyek) ?? { stok: 0, jumlahItem: 0, jumlahLowStock: 0 };
    entry.stok += item.stok;
    entry.jumlahItem += 1;
    if (item.stok <= item.minStok) entry.jumlahLowStock += 1;
    stokPerProyek.set(item.proyek, entry);
  }
  return {
    totalStok: items.reduce((acc, item) => acc + item.stok, 0),
    jumlahLowStock: items.filter((item) => item.stok <= item.minStok).length,
    daftarMerek: Array.from(new Set(items.map((item) => item.merek))).sort(),
    daftarProyek: Array.from(new Set(items.map((item) => item.proyek).filter((p): p is string => Boolean(p)))).sort(),
    totalEceran: items.filter((item) => item.kategoriBarang === "eceran").length,
    totalProyek: items.filter((item) => item.kategoriBarang === "proyek").length,
    stokPerProyek: Array.from(stokPerProyek.entries()).sort(([left], [right]) => left.localeCompare(right)),
  };
}

export function computeMovementMetrics(movements: GudangMovement[]) {
  return {
    totalMasuk: movements
      .filter((movement) => movement.tipe === "masuk")
      .reduce((acc, movement) => acc + movement.jumlah, 0),
    totalKeluar: movements
      .filter((movement) => movement.tipe === "keluar")
      .reduce((acc, movement) => acc + movement.jumlah, 0),
  };
}

export function formatTanggal(tanggal: string): string {
  const date = new Date(`${tanggal}T00:00:00`);
  if (isNaN(date.getTime())) return tanggal;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatWaktu(createdAt: string): string {
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return createdAt;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateId(): string {
  return `gd-${Date.now()}`;
}
