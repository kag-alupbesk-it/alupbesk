export type MovementTipe = "masuk" | "keluar";

// Input bersama untuk pencatatan masuk & keluar
export interface GudangMovementInput {
  jumlah: number;
  tanggal: string;
  catatan?: string;
}

// Catatan barang masuk: dari siapa (supplier/tengkulak) + bukti nota
export interface MasukInput extends GudangMovementInput {
  sumber: string;
  buktiNota?: string;
}

// Catatan barang keluar: ke mana (proyek/penjualan) + siapa penerimanya
export interface KeluarInput extends GudangMovementInput {
  tujuan: string;
  penerima: string;
}

export interface GudangMovement {
  id: string;
  itemId: string;
  tipe: MovementTipe;
  jumlah: number;
  tanggal: string;
  createdAt: string;
  sumber?: string;
  buktiNota?: string;
  tujuan?: string;
  penerima?: string;
  catatan?: string;
  stokSebelum: number;
  stokSesudah: number;
}

export type GudangMovementResult =
  | { ok: true; item: { id: string; stok: number }; movement: GudangMovement }
  | { ok: false; code: "GUDANG_ITEM_NOT_FOUND" | "GUDANG_STOCK_NOT_ENOUGH" };
