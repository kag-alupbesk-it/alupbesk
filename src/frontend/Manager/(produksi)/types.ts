// Modul Manajer Produksi (/produksi) - seluruh data di halaman ini bersifat
// mock dan hanya hidup di React state lokal (tidak ada backend / API / database).

// Status gambar teknik kerja. Manajer Produksi mengunggah gambar, lalu PM yang
// memberi ACC. "revisi" berarti PM meminta perbaikan sehingga perlu unggah ulang.
//
// Status pengerjaan SPK sengaja TIDAK disimpan sebagai field, karena kalau
// disimpan ia bisa melenceng dari status gambar. Semua layar menghitungnya lewat
// alurSPK() di utils/alur.ts sehingga angkanya selalu konsisten.
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

// Label kolom "Status Gambar Teknik" selalu menjelaskan kondisi BERKAS gambar.
// Kata-katanya sengaja dibedakan dari label alur di sebelahnya, supaya satu
// baris tidak pernah menampilkan dua badge dengan teks yang sama.
export const statusGambarLabels: Record<StatusGambarTeknik, string> = {
  belum_diunggah: "Belum Diunggah",
  menunggu_acc: "Menunggu Review PM",
  acc_pm: "Disetujui PM",
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
