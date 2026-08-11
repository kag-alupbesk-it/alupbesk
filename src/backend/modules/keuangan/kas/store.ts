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

// Seed pengeluaran operasional awal (dijalankan sekali, idempotent).
export function seedKasEntries(): void {
  if (kasEntries.size > 0) return;
  const now = Date.now();
  const iso = (offsetMinutes: number): string =>
    new Date(now - offsetMinutes * 60000).toISOString();

  persistKasEntry({
    id: "keu-keluar-1",
    tipe: "keluar",
    sumber: "Manual",
    deskripsi: "Belanja bahan baku aluminium",
    jumlah: 12500000,
    kategori: "operasional",
    tanggal: iso(60 * 24 * 3).slice(0, 10),
    createdAt: iso(60 * 24 * 3),
  });
  persistKasEntry({
    id: "keu-keluar-2",
    tipe: "keluar",
    sumber: "Manual",
    deskripsi: "Operasional gudang (listrik & gudang)",
    jumlah: 2000000,
    kategori: "operasional",
    tanggal: iso(60 * 24).slice(0, 10),
    createdAt: iso(60 * 24),
  });
}
