// Manajer Lapangan: pengiriman order "Siap Kirim" ke lokasi proyek kontraktor.
// Status alur: siap-kirim (dibuatkan surat jalan) -> dalam-pengiriman (armada
// berangkat, boleh partial shipment) -> selesai-kirim (POD lengkap: e-signature,
// geotag, dan foto bukti).
export type FieldDeliveryStatus = "siap-kirim" | "dalam-pengiriman" | "selesai-kirim";

export interface FieldDeliveryItem {
  id: string;
  namaBarang: string;
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

export interface FieldGeotag {
  latitude: number;
  longitude: number;
  timestamp: string;
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
  geotag?: FieldGeotag;
  signatureDataUrl?: string;
  podPath?: string;
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

// Input untuk menyelesaikan POD: geotag + e-signature + path foto bukti.
export interface PodInput {
  geotag: FieldGeotag;
  signatureDataUrl: string;
  podPath: string;
}

export type FieldDeliveryResult =
  | { ok: true; delivery: FieldDelivery }
  | { ok: false; code: "DELIVERY_NOT_FOUND" | "STATUS_INVALID"; message?: string };