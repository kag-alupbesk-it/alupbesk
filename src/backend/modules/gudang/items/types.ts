export type KategoriBarang = "eceran" | "proyek";

export interface GudangItem {
  id: string;
  sku: string;
  jenisBarang: string;
  // Pemisahan jenis barang sesuai industri konstruksi:
  // "eceran" = baut, gagang pintu, sekrup, engsel (kelola per satuan kecil)
  // "proyek" = kusen, aluminium, bahan bangunan besar (bisa milik proyek tertentu)
  kategoriBarang: KategoriBarang;
  satuan: string;
  merek: string;
  warna: string;
  seksiLokasi: string;
  stok: number;
  minStok: number;
  proyek?: string;
  catatan?: string;
}
