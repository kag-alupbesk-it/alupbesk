export type FieldFilter = "ALL" | "siap-kirim" | "dalam-pengiriman" | "selesai-kirim";

export interface FieldDeliveryRow {
  id: string;
  kodeProduksi: string;
  namaKontraktor: string;
  alamatProyek: string;
  telepon?: string;
  tanggalKirim: string;
  status: FieldFilter;
  totalItem: number;
  totalKuantitas: number;
  kuantitasTerkirim: number;
  armadaNamaSopir?: string;
}

export type FieldAction = "surat-jalan" | "pod";