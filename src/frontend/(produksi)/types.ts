// Modul Manajer Produksi (/produksi) - seluruh data di halaman inibersifat
// mock dan hanya hidup di React state lokal (tidak ada backend / API / database).

// Status pengerjaan SPK. Dipakai untuk kartu ringkasan dashboard, filter tabel,
// dan penentuan tahapan produksi yang sedang berjalan.
export type StatusPengerjaan = "butuh_gambar" | "menunggu_acc" | "dalam_produksi" | "siap_kirim";

// Status gambar teknik kerja. Manajer Produksi mengunggah gambar, lalu PM yang
// memberi ACC. "revisi" berarti PM meminta perbaikan sehingga perlu unggah ulang.
export type StatusGambarTeknik = "belum_diunggah" | "menunggu_acc" | "acc_pm" | "revisi";

// Tahapan pengerjaan di workshop. Urutan ini adalah stepper interaktif pada
// halaman detail SPK.
export type TahapanProduksi = "pemotongan" | "perakitan" | "finishing" | "qc" | "siap_kirim";

export const tahapanOrder: TahapanProduksi[] = [
  "pemotongan",
  "perakitan",
  "finishing",
  "qc",
  "siap_kirim",
];

export interface ItemSPK {
  // Kode barang / SKU dari gudang, mis. "ALB-CW-014".
  kode: string;
  nama: string;
  kuantitas: number;
  satuan: string;
  catatanSpesifikasi: string;
}

export interface BerkasGambar {
  nama: string;
  ukuran: number;
  tipe: string;
  // object URL dari File yang dipilih pengguna. Hanya ada di sesi browser ini.
  url?: string;
}

export interface SPK {
  nomor: string;
  // Kode produksi dari kontraktor. Nullable karena beberapa order belum punya
  // kode (kontraktor mengirim sketsa tanpa kode), sehingga kolom tabel harus
  // aman menampilkan "—".
  kodeProduksi: string | null;
  namaKontraktor: string;
  telepon?: string;
  alamatProyek?: string;
  targetDeadline: string;
  tanggalMasuk: string;
  statusPengerjaan: StatusPengerjaan;
  statusGambar: StatusGambarTeknik;
  tahapan: TahapanProduksi;
  item: ItemSPK[];
  // Berkas gambar teknik yang sudah diunggah tim produksi.
  gambarTeknik?: BerkasGambar;
  // Sketsa mentah dari kontraktor, dipakai sebagai acuan tim teknis.
  gambarAcuan?: { nama: string; url?: string; catatan?: string };
  catatanTeknis?: string;
  tanggalAcc?: string;
  revisiCount: number;
  aktivitasTerakhir: string;
}

export interface KirimGambarInput {
  spkNomor: string;
  berkas: BerkasGambar;
  catatanTeknis: string;
}

export const statusPengerjaanLabels: Record<StatusPengerjaan, string> = {
  butuh_gambar: "Butuh Gambar Teknik",
  menunggu_acc: "Menunggu ACC PM",
  dalam_produksi: "Dalam Proses Produksi",
  siap_kirim: "Siap Kirim",
};

export const statusGambarLabels: Record<StatusGambarTeknik, string> = {
  belum_diunggah: "Belum Diunggah",
  menunggu_acc: "Menunggu ACC",
  acc_pm: "ACC PM",
  revisi: "Perlu Revisi",
};

export const tahapanLabels: Record<TahapanProduksi, string> = {
  pemotongan: "Pemotongan",
  perakitan: "Perakitan",
  finishing: "Finishing",
  qc: "QC",
  siap_kirim: "Siap Kirim",
};

export const tahapanDescriptions: Record<TahapanProduksi, string> = {
  pemotongan: "Pemotongan profil sesuai ukuran gambar teknik",
  perakitan: "Pemasangan frame, kaca, dan aksesoris",
  finishing: "Anodizing / powder coating dan pembersihan",
  qc: "Pemeriksaan mutu dan pengukuran akhir",
  siap_kirim: "Barang siap diserahkan ke tim lapangan",
};

export const filterPengerjaanLabels: Record<StatusPengerjaan | "all", string> = {
  all: "Semua Status Pengerjaan",
  ...statusPengerjaanLabels,
};
