import type { KasEntry } from "../types";

const now = Date.now();
const iso = (offsetMinutes: number): string =>
  new Date(now - offsetMinutes * 60000).toISOString();

// Pengeluaran kas yang dicatat admin keuangan. Pemasukan dihitung otomatis
// dari pesanan (lihat getKasData), jadi hanya pengeluaran yang disimpan.
export const pengeluaran = new Map<string, KasEntry>([
  [
    "keu-keluar-1",
    {
      id: "keu-keluar-1",
      tipe: "keluar",
      sumber: "Manual",
      deskripsi: "Belanja bahan baku aluminium",
      jumlah: 12500000,
      kategori: "operasional",
      tanggal: iso(60 * 24 * 3).slice(0, 10),
      createdAt: iso(60 * 24 * 3),
    },
  ],
  [
    "keu-keluar-2",
    {
      id: "keu-keluar-2",
      tipe: "keluar",
      sumber: "Manual",
      deskripsi: "Operasional gudang (listrik & gudang)",
      jumlah: 2000000,
      kategori: "operasional",
      tanggal: iso(60 * 24).slice(0, 10),
      createdAt: iso(60 * 24),
    },
  ],
]);
