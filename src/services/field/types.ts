// Manajer Lapangan: pengiriman order "Siap Kirim" ke lokasi proyek kontraktor.
// Status alur: siap-kirim (dibuatkan surat jalan) -> dalam-pengiriman (armada
// berangkat, boleh partial shipment) -> selesai-kirim (bukti terima lengkap:
// foto tanda tangan penerima di surat jalan dan foto bukti proyek yang sampai).
export type FieldDeliveryStatus = "siap-kirim" | "dalam-pengiriman" | "selesai-kirim";

export interface FieldDeliveryItem {
  id: string;
  namaBarang: string;
  // Kategori jenis barang (mis. "Aluminium", "Kaca", "Aksesoris"). Dipakai di
  // kolom "Jenis Barang" pada tabel surat jalan cetak.
  jenisBarang: string;
  spesifikasi?: string;
  satuan: string;
  // kuantitas total pesanan kontraktor; kuantitasTerkirim = akumulasi partial
  // shipment yang sudah dikirim/diPOD-kan, sehingga sisa otomatis =
  // kuantitas - kuantitasTerkirim.
  kuantitas: number;
  kuantitasTerkirim: number;
  catatan?: string;
}

export interface FieldArmada {
  namaSopir: string;
  platNomor: string;
  jenisArmada: string;
}

export interface FieldDelivery {
  id: string;
  kodeProduksi: string;
  namaKontraktor: string;
  alamatProyek: string;
  telepon?: string;
  tanggalKirim: string;
  items: FieldDeliveryItem[];
  status: FieldDeliveryStatus;
  armada?: FieldArmada;
  // Dua gambar bukti terima yang wajib diunggah saat menyelesaikan pengiriman.
  // signatureImagePath: foto tanda tangan penerima pada surat jalan.
  // projectImagePath: foto bukti barang/proyek yang sudah sampai di lokasi.
  signatureImagePath?: string;
  projectImagePath?: string;
  cetakCount: number;
  createdAt: string;
  updatedAt: string;
}

// Input untuk membuat surat jalan: data armada + kuantitas yang dikirim pada
// pengiriman ini (kuantitas <= sisa). Sisa dihitung otomatis dari store.
export interface SuratJalanInput {
  armada: FieldArmada;
  kirim: { itemId: string; kuantitas: number }[];
}

// Input untuk menyelesaikan bukti terima: path foto tanda tangan penerima pada
// surat jalan + path foto bukti proyek yang sudah sampai.
export interface PodInput {
  signatureImagePath: string;
  projectImagePath: string;
}

export type FieldDeliveryResult =
  | { ok: true; delivery: FieldDelivery }
  | { ok: false; code: "DELIVERY_NOT_FOUND" | "STATUS_INVALID"; message?: string };