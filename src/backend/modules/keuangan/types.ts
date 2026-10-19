// Modul keuangan untuk role "Admin Keuangan": kas (pemasukan & pengeluaran),
// dan laporan (reuse laporan keuangan).

export type KasTipe = "masuk" | "keluar";
export type KasKategori = "eceran" | "proyek" | "operasional";

// Satu baris transaksi kas. Pemasukan disinkronkan otomatis dari pesanan
// disetujui dan bisa dikoreksi manual; pengeluaran dicatat manual oleh
// admin keuangan. Keduanya bisa ditambah, diubah, dan dihapus (CRUD).
export interface KasEntry {
  id: string;
  tipe: KasTipe;
  sumber: string;
  deskripsi: string;
  jumlah: number;
  kategori: KasKategori;
  tanggal: string;
  createdAt: string;
}

export interface KasEntryInput {
  tipe: KasTipe;
  deskripsi: string;
  jumlah: number;
  kategori: KasKategori;
  tanggal?: string;
}

export interface KasData {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  masuk: KasEntry[];
  keluar: KasEntry[];
}

export type KasResult =
  | { ok: true; entry: KasEntry }
  | { ok: false; code: "INVALID_AMOUNT" | "INVALID_INPUT" | "KAS_ENTRY_NOT_FOUND" };
