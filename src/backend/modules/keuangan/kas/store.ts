import { enqueueUpsert } from "@/services/supabase";
import type { KasEntry } from "../types";

// Buku kas: semua transaksi (pemasukan & pengeluaran) disimpan di sini.
// Pemasukan awal disinkronkan dari pesanan (lihat sync.ts), pengeluaran
// dicatat manual. Semua bisa dikoreksi (CRUD) oleh admin keuangan.
// Persisten ke tabel kas_entries di Supabase lewat antrean tulis.
export const kasEntries = new Map<string, KasEntry>();

// Menyimpan transaksi ke memori sekaligus mengantrekan tulis ke Supabase.
export function persistKasEntry(entry: KasEntry): void {
  kasEntries.set(entry.id, entry);
  enqueueUpsert(
    "kas_entries",
    {
      id: entry.id,
      tipe: entry.tipe,
      sumber: entry.sumber,
      deskripsi: entry.deskripsi,
      jumlah: entry.jumlah,
      kategori: entry.kategori,
      tanggal: entry.tanggal,
      created_at: entry.createdAt,
    },
    "id",
  );
}

