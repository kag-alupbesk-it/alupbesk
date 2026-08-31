import { enqueueUpsert } from "@/services/supabase";
import type { GudangItem } from "./types";

// Item gudang diisi dari database (Supabase) saat hydrate. Kosong berarti
// belum ada data; data hanya muncul ketika ditambahkan oleh admin gudang.
export const gudangItems = new Map<string, GudangItem>();

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
