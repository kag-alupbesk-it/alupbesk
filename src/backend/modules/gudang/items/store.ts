import type { GudangItem } from "./types";

// Seed data awal agar halaman gudang & inventory bisa diuji; ganti dengan data nyata saat database aktif.
export const gudangItems = new Map<string, GudangItem>([
  ["gd-101", { id: "gd-101", sku: "HND-DKS-BK-001", jenisBarang: "handle", merek: "DEKSON", warna: "Black Matte", seksiLokasi: "Seksi 1", stok: 145, minStok: 20, catatan: "Rak utama depan" }],
  ["gd-102", { id: "gd-102", sku: "MRT-SLD-SS-808", jenisBarang: "mortise", merek: "SOLID", warna: "Stainless Steel", seksiLokasi: "Seksi 2", stok: 6, minStok: 15 }],
]);
