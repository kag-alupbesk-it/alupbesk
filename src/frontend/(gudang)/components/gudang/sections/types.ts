export type KategoriBarang = "eceran" | "proyek";

export interface GudangItem {
  id: string;
  sku: string;
  jenisBarang: string;
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

export interface GudangItemInput {
  sku: string;
  jenisBarang: string;
  kategoriBarang: KategoriBarang;
  satuan: string;
  merek: string;
  warna: string;
  seksiLokasi: string;
  stokAwal: number;
  minStok: number;
  proyek?: string;
  catatan?: string;
  sumberAwal?: string;
}

export type MovementTipe = "masuk" | "keluar";

export interface GudangMovement {
  id: string;
  itemId: string;
  tipe: MovementTipe;
  jumlah: number;
  tanggal: string;
  createdAt: string;
  sumber?: string;
  buktiNota?: string;
  tujuan?: string;
  penerima?: string;
  catatan?: string;
  stokSebelum: number;
  stokSesudah: number;
}

export interface GudangMasukInput {
  jumlah: number;
  tanggal: string;
  sumber: string;
  buktiNota?: string;
  catatan?: string;
}

export interface GudangKeluarInput {
  jumlah: number;
  tanggal: string;
  tujuan: string;
  penerima: string;
  catatan?: string;
}
