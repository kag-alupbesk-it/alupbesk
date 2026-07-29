export interface GudangItem {
  id: string;
  sku: string;
  jenisBarang: "handle" | "mortise";
  merek: string;
  warna: string;
  seksiLokasi: string;
  stok: number;
  minStok: number;
  catatan?: string;
}
