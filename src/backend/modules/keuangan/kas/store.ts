import type { KasEntry } from "../types";

// Buku kas: semua transaksi (pemasukan & pengeluaran) disimpan di sini.
// Pemasukan awal disinkronkan dari pesanan (lihat sync.ts), pengeluaran
// dicatat manual. Semua bisa dikoreksi (CRUD) oleh admin keuangan.
export const kasEntries = new Map<string, KasEntry>();

// Seed pengeluaran operasional awal (dijalankan sekali, idempotent).
export function seedKasEntries(): void {
  if (kasEntries.size > 0) return;
  const now = Date.now();
  const iso = (offsetMinutes: number): string =>
    new Date(now - offsetMinutes * 60000).toISOString();

  kasEntries.set("keu-keluar-1", {
    id: "keu-keluar-1",
    tipe: "keluar",
    sumber: "Manual",
    deskripsi: "Belanja bahan baku aluminium",
    jumlah: 12500000,
    kategori: "operasional",
    tanggal: iso(60 * 24 * 3).slice(0, 10),
    createdAt: iso(60 * 24 * 3),
  });
  kasEntries.set("keu-keluar-2", {
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
