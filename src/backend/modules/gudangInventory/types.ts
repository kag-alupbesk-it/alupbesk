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
  createdAt: string;
  updatedAt: string;
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
  | "DUPLICATE_MODEL";

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
