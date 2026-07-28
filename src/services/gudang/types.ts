// Interface entitas barang inventaris gudang.
// Dipisahkan ke types.ts agar bisa digunakan bersama oleh services, components, dan API
// tanpa circular dependency.
export interface GudangItem {
  id: string;
  sku: string;
  // Kategori fungsional barang — dipakai untuk filter dan grouping tampilan
  jenisBarang: "handle" | "mortise";
  merek: string;
  warna: string;
  // Lokasi fisik barang di dalam gudang — penting untuk efisiensi picking
  seksiLokasi: string;
  stok: number;
  // Batas minimum sebelum memicu peringatan low stock — nilai berbeda per SKU
  // karena frekuensi permintaan tiap barang berbeda
  minStok: number;
  catatan?: string;
}