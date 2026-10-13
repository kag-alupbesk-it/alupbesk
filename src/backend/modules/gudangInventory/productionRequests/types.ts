// Tipe domain permintaan produksi ke gudang. Divisi produksi mengajukan
// daftar material, lalu pihak gudang menyetujui (stok dipotong otomatis)
// atau menolak beserta alasan.

export type ProductionRequestStatus = "diajukan" | "disetujui" | "ditolak";

// Snapshot barang saat pengajuan dibuat (stok/harga bisa berubah belakangan).
// Lokasi rak/baris ikut disimpan dari Master Stok karena divisi produksi tidak
// mengetahuinya — pihak gudang memakai data ini untuk mengambil barang.
export interface ProductionRequestItem {
  id: string;
  itemId: string | null;
  categoryId: string;
  categoryName: string;
  itemName: string;
  modelNo: string;
  brand: string;
  color: string;
  rackGroup: string;
  subRow: string;
  quantity: number;
}

export interface ProductionRequest {
  id: string;
  requestDate: string;
  spkRef: string;
  spkLabel: string;
  requesterName: string;
  note: string;
  status: ProductionRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  items: ProductionRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRequestItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateProductionRequestInput {
  requestDate: string;
  spkRef: string;
  spkLabel?: string;
  requesterName: string;
  note?: string;
  items: ProductionRequestItemInput[];
}

export type ProductionRequestErrorCode =
  | "ITEM_NOT_FOUND"
  | "NO_ITEMS"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_STATUS_INVALID"
  | "INSUFFICIENT_STOCK";

// `detail` dipakai untuk pesan spesifik (mis. nama barang yang stoknya kurang).
// `replaced` menandai pengajuan yang ternyata revisi (mengganti permintaan
// pending untuk SPK yang sama) dan bukan pengajuan baru.
export type ProductionRequestResult<T> =
  | { ok: true; data: T; replaced?: boolean }
  | { ok: false; code: ProductionRequestErrorCode; detail?: string };
