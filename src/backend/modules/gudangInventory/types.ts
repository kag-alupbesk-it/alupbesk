// Tipe domain modul gudang inventaris. Dipakai bersama oleh store, logika,
// Route Handler, dan helper Excel.

export interface GudangCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface GudangInventoryItem {
  id: string;
  categoryId: string;
  itemName: string;
  brand: string;
  modelNo: string;
  color: string;
  rackGroup: string;
  subRow: string;
  currentStock: number;
  unit: string;
  materialKind: MaterialKind;
  lengthPerUnit: number | null;
  widthPerUnit: number | null;
  weightPerUnit: number | null;
  createdAt: string;
  updatedAt: string;
}

// Jenis bahan: 'unit' = barang satuan biasa; 'bar' = batang profil;
// 'sheet' = lembaran; 'roll' = gulungan. Selain 'unit', bahan dilacak lewat
// lot agar sisa potong dapat dipakai ulang.
export type MaterialKind = "unit" | "bar" | "sheet" | "roll";

export type MaterialLotStatus = "tersedia" | "sisa" | "scrap" | "habis";

export interface GudangMaterialLot {
  id: string;
  itemId: string;
  lotCode: string;
  receivedDate: string;
  inTransactionId: string | null;
  length: number | null;
  width: number | null;
  quantity: number;
  rackGroup: string;
  subRow: string;
  status: MaterialLotStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// Lot lengkap dengan info bahan induk untuk kebutuhan tampilan.
export interface GudangMaterialLotView extends GudangMaterialLot {
  itemName: string;
  modelNo: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  materialKind: MaterialKind;
}

export interface GudangMaterialLotInput {
  itemId: string;
  lotCode?: string;
  receivedDate?: string;
  inTransactionId?: string | null;
  length?: number | null;
  width?: number | null;
  quantity?: number;
  rackGroup?: string;
  subRow?: string;
  status?: MaterialLotStatus;
  note?: string;
}

export interface GudangInTransaction {
  id: string;
  transactionDate: string;
  categoryId: string;
  itemId: string;
  quantity: number;
  createdBy: string;
  createdAt: string;
}

// Asal barang keluar: input manual admin gudang atau hasil ACC permintaan
// produksi.
export type GudangOutSource = "manual" | "produksi";

export interface GudangOutTransaction {
  id: string;
  transactionDate: string;
  categoryId: string;
  itemId: string;
  projectId: string | null;
  projectName: string;
  source: GudangOutSource;
  quantity: number;
  createdBy: string;
  createdAt: string;
}

// Barang master stok yang sudah dilengkapi nama kategori, dipakai oleh UI
// pemilih barang (mis. form permintaan produksi).
export interface GudangInventoryItemView extends GudangInventoryItem {
  categoryName: string;
}

export interface GudangInventoryItemInput {
  categoryId: string;
  itemName: string;
  brand?: string;
  modelNo?: string;
  color?: string;
  rackGroup?: string;
  subRow?: string;
  currentStock?: number;
  unit?: string;
  materialKind?: MaterialKind;
  lengthPerUnit?: number | null;
  widthPerUnit?: number | null;
  weightPerUnit?: number | null;
}

export interface GudangInTransactionInput {
  transactionDate: string;
  itemId: string;
  quantity: number;
  createdBy: string;
}

export interface GudangOutTransactionInput {
  transactionDate: string;
  itemId: string;
  projectId?: string | null;
  projectName?: string;
  source?: GudangOutSource;
  quantity: number;
  createdBy: string;
}

export type GudangInventoryErrorCode =
  | "CATEGORY_NOT_FOUND"
  | "ITEM_NOT_FOUND"
  | "INSUFFICIENT_STOCK"
  | "DUPLICATE_MODEL"
  | "LOT_NOT_FOUND"
  | "INSUFFICIENT_LOT";

export type GudangInventoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: GudangInventoryErrorCode };

// Satu baris riwayat transaksi yang sudah di-resolve (untuk UI & Excel).
export interface GudangInTransactionView extends GudangInTransaction {
  categoryName: string;
  itemName: string;
  modelNo: string;
  brand: string;
  color: string;
  rackGroup: string;
}

export interface GudangOutTransactionView extends GudangOutTransaction {
  categoryName: string;
  itemName: string;
  modelNo: string;
  brand: string;
  color: string;
  rackGroup: string;
}
