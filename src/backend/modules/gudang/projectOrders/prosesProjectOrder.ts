import { persistProjectOrder, projectOrders } from "./store";
import { getGudangItems } from "../items/getGudangItems";
import { createGudangKeluar } from "../movements/createGudangKeluar";
import type { ProjectOrder, ProjectProcessResult } from "./types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Menerima pesanan proyek: stok item proyek dipotong otomatis (barang keluar
// dengan tujuan nama proyek) dan status naik ke "diproses". Stok semua baris
// divalidasi dulu agar tidak ada potongan parsial.
export function prosesProjectOrder(id: string): ProjectProcessResult {
  const current = projectOrders.get(id);
  if (!current) return { ok: false, code: "ORDER_NOT_FOUND" };
  if (current.status !== "diajukan") return { ok: false, code: "ORDER_STATUS_INVALID" };

  const gudangItems = getGudangItems();
  const failed: { sku: string; nama: string; quantity: number; reason: string }[] = [];

  for (const item of current.items) {
    const gudangItem = gudangItems.find((g) => g.id === item.gudangItemId);
    if (!gudangItem) {
      failed.push({
        sku: item.sku,
        nama: `${item.jenisBarang} ${item.merek}`,
        quantity: item.quantity,
        reason: "Barang tidak terdaftar di gudang.",
      });
    } else if (item.quantity > gudangItem.stok) {
      return { ok: false, code: "STOCK_NOT_ENOUGH" };
    }
  }

  for (const item of current.items) {
    const gudangItem = gudangItems.find((g) => g.id === item.gudangItemId);
    if (!gudangItem) continue;
    createGudangKeluar(gudangItem.id, {
      jumlah: item.quantity,
      tanggal: todayIso(),
      tujuan: current.namaProyek,
      penerima: current.pelanggan,
      catatan: `Pesanan proyek ${current.id}`,
    });
  }

  const updated: ProjectOrder = {
    ...current,
    status: "diproses",
    processedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  persistProjectOrder(updated);

  return { ok: true, order: updated, failed };
}
