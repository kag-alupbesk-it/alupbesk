import { enqueueUpsert } from "@/services/supabase";
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

// Menyimpan item ke memori sekaligus mengantrekan tulis ke Supabase.
export function persistGudangItem(item: GudangItem): void {
  gudangItems.set(item.id, item);
  enqueueUpsert(
    "gudang_items",
    {
      id: item.id,
      sku: item.sku,
      jenis_barang: item.jenisBarang,
      kategori_barang: item.kategoriBarang,
      satuan: item.satuan,
      merek: item.merek,
      warna: item.warna,
      seksi_lokasi: item.seksiLokasi,
      stok: item.stok,
      min_stok: item.minStok,
      proyek: item.proyek ?? null,
      catatan: item.catatan ?? null,
    },
    "id",
  );
}
