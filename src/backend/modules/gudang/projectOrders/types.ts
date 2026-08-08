// Pesanan proyek: pesanan yang dibuat dari permintaan custom (orang yang
// order custom). Barangnya diambil dari item gudang ber-kategori "proyek".
export type ProjectOrderStatus = "diajukan" | "diproses" | "selesai";

// Snapshot barang proyek saat pesanan dibuat (stok bisa berubah belakangan).
export interface ProjectOrderItem {
  gudangItemId: string;
  sku: string;
  jenisBarang: string;
  merek: string;
  warna: string;
  satuan: string;
  quantity: number;
}

export interface ProjectOrder {
  id: string;
  requestId?: string;
  namaProyek: string;
  pelanggan: string;
  perusahaan?: string;
  telepon?: string;
  catatan?: string;
  items: ProjectOrderItem[];
  totalQuantity: number;
  status: ProjectOrderStatus;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface CreateProjectOrderInput {
  requestId?: string;
  namaProyek: string;
  pelanggan?: string;
  telepon?: string;
  catatan?: string;
  items: { gudangItemId: string; quantity: number }[];
}

export type ProjectOrderResult =
  | { ok: true; order: ProjectOrder }
  | { ok: false; code: "ORDER_NOT_FOUND" | "ORDER_STATUS_INVALID" };

export type ProjectOrderDeleteResult =
  | { ok: true }
  | { ok: false; code: "ORDER_NOT_FOUND" | "ORDER_NOT_DELETABLE" };

export interface ProjectProcessResult {
  ok: boolean;
  code?: "ORDER_NOT_FOUND" | "ORDER_STATUS_INVALID" | "STOCK_NOT_ENOUGH";
  order?: ProjectOrder;
  failed?: { sku: string; nama: string; quantity: number; reason: string }[];
}
