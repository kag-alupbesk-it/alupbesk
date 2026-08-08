import { gudangItems } from "./store";
import { generateMovementId, gudangMovements } from "../movements/store";
import type { GudangItem, KategoriBarang } from "./types";
import type { GudangMovement } from "../movements/types";

export interface GudangItemInput {
  sku: string;
  jenisBarang: string;
  kategoriBarang: KategoriBarang;
  satuan: string;
  merek: string;
  warna: string;
  seksiLokasi: string;
  stokAwal: number;
  minStok: number;
  proyek?: string;
  catatan?: string;
  sumberAwal?: string;
}

export type GudangItemCreateResult =
  | { ok: true; item: GudangItem }
  | { ok: false; code: "DUPLICATE_SKU" };

// Menambah item gudang baru. Jika stokAwal > 0, sekaligus dicatat sebagai
// barang masuk pertama agar riwayat pergerakan tetap lengkap.
export function createGudangItem(input: GudangItemInput): GudangItemCreateResult {
  const sku = input.sku.trim().toUpperCase();
  const duplicate = [...gudangItems.values()].some((item) => item.sku.toUpperCase() === sku);
  if (duplicate) return { ok: false, code: "DUPLICATE_SKU" };

  const id = `gd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const item: GudangItem = {
    id,
    sku,
    jenisBarang: input.jenisBarang.trim(),
    kategoriBarang: input.kategoriBarang,
    satuan: input.satuan.trim(),
    merek: input.merek.trim(),
    warna: input.warna.trim(),
    seksiLokasi: input.seksiLokasi.trim(),
    stok: input.stokAwal,
    minStok: input.minStok,
    proyek: input.proyek?.trim() || undefined,
    catatan: input.catatan?.trim() || undefined,
  };
  gudangItems.set(id, item);

  if (input.stokAwal > 0) {
    const movement: GudangMovement = {
      id: generateMovementId(),
      itemId: id,
      tipe: "masuk",
      jumlah: input.stokAwal,
      tanggal: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      sumber: input.sumberAwal?.trim() || "Stok Awal",
      catatan: "Pencatatan barang baru",
      stokSebelum: 0,
      stokSesudah: input.stokAwal,
    };
    gudangMovements.set(movement.id, movement);
  }

  return { ok: true, item };
}
