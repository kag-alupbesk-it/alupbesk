// Modul keuangan untuk role "Admin Keuangan": kas (pemasukan & pengeluaran),
// penagihan (status bayar per pesanan), dan laporan (reuse laporan keuangan).

export type KasTipe = "masuk" | "keluar";
export type PaymentStatus = "belum_bayar" | "lunas";
export type KasKategori = "eceran" | "proyek" | "operasional";

// Satu baris transaksi kas. Pemasukan otomatis dari pesanan; pengeluaran
// dicatat manual oleh admin keuangan.
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

export interface KasData {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  masuk: KasEntry[];
  keluar: KasEntry[];
}

export interface PenagihanItem {
  id: string;
  sumber: string;
  pelanggan: string;
  nilai: number;
  status: PaymentStatus;
  kategori: KasKategori;
  tanggal: string;
}

export type KasResult =
  | { ok: true; entry: KasEntry }
  | { ok: false; code: "INVALID_AMOUNT" };

export type PenagihanResult =
  | { ok: true; item: PenagihanItem }
  | { ok: false; code: "TAGIHAN_NOT_FOUND" };
