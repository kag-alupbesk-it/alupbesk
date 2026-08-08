import { getLocalOrder, publishOrderStatus } from "@/services/orders";
import { getCatalogProduct } from "@/services/catalog";
import { getGudangItems, createGudangKeluar } from "@/backend/modules/gudang";
import type { GudangOrderDeduction, GudangProcessResult } from "./types";
import { computeOrderSegment } from "./segment";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Menerima pesanan yang disetujui manajer: setiap baris produk dicocokkan ke
// item gudang lewat SKU lalu dicatat sebagai barang keluar (penjualan), dan
// status pesanan naik ke "processing". Stok gudang berkurang otomatis.
export function processGudangOrder(id: string): GudangProcessResult {
  const current = getLocalOrder(id);
  if (!current) return { ok: false, code: "ORDER_NOT_FOUND" };
  if (current.status !== "confirmed")
    return { ok: false, code: "ORDER_STATUS_INVALID" };

  // Validasi stok semua baris dulu agar tidak ada potongan parsial.
  for (const line of current.items) {
    const product = getCatalogProduct(line.productId);
    const sku = product?.sku ?? "";
    const item = getGudangItems().find((gudangItem) => gudangItem.sku === sku);
    if (item && line.quantity > item.stok) return { ok: false, code: "STOCK_NOT_ENOUGH" };
  }

  const deductions: GudangOrderDeduction[] = current.items.map((line) => {
    const product = getCatalogProduct(line.productId);
    const sku = product?.sku ?? "";
    const item = getGudangItems().find((gudangItem) => gudangItem.sku === sku);
    if (!item)
      return { ok: false, sku, title: line.title, quantity: line.quantity, reason: "Barang tidak terdaftar di gudang." };

    const result = createGudangKeluar(item.id, {
      jumlah: line.quantity,
      tanggal: todayIso(),
      tujuan: "Penjualan",
      penerima: current.customer.name,
      catatan: `Pesanan ${id}`,
    });

    if (!result.ok)
      return { ok: false, sku, title: line.title, quantity: line.quantity, gudangItemId: item.id, reason: "Stok gudang tidak cukup." };

    return { ok: true, sku, title: line.title, quantity: line.quantity, gudangItemId: item.id };
  });

  const updated = publishOrderStatus(id, "processing");
  if (!updated) return { ok: false, code: "ORDER_NOT_FOUND" };

  return {
    ok: true,
    order: { ...updated, status: "processing", processedAt: updated.updatedAt, segmen: computeOrderSegment(updated) },
    deductions,
  };
}
