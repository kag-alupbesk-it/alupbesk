import type { GudangItem } from "./types";

// Seed data awal agar halaman gudang & inventory bisa diuji; ganti dengan data nyata saat database aktif.
export const gudangItems = new Map<string, GudangItem>([
  [
    "gd-101",
    {
      id: "gd-101",
      sku: "HND-DKS-BK-001",
      jenisBarang: "handle",
      kategoriBarang: "eceran",
      satuan: "pcs",
      merek: "DEKSON",
      warna: "Black Matte",
      seksiLokasi: "Seksi 1",
      stok: 145,
      minStok: 20,
      catatan: "Rak utama depan",
    },
  ],
  [
    "gd-102",
    {
      id: "gd-102",
      sku: "MRT-SLD-SS-808",
      jenisBarang: "mortise",
      kategoriBarang: "proyek",
      satuan: "set",
      merek: "SOLID",
      warna: "Stainless Steel",
      seksiLokasi: "Seksi 2",
      stok: 6,
      minStok: 15,
      proyek: "Proyek Apartemen Citra 2",
    },
  ],
  [
    "gd-103",
    {
      id: "gd-103",
      sku: "KSN-ALU-900",
      jenisBarang: "kusen",
      kategoriBarang: "proyek",
      satuan: "batang",
      merek: "ALUP",
      warna: "Natural Anodized",
      seksiLokasi: "Seksi 3",
      stok: 24,
      minStok: 5,
      proyek: "Proyek Apartemen Citra 2",
      catatan: "Aluminium 6063-T5",
    },
  ],
]);
