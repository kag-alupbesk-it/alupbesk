import type { LocalOrder } from "@/services/orders";

// Pesanan yang ditangani gudang: sudah disetujui manajer dan menunggu/dalam
// proses pengiriman, atau sudah selesai dikirim.
export type GudangOrderStatus = "confirmed" | "processing" | "completed";

// Segmen pesanan berdasarkan kategori item gudang yang cocok dengan SKU
// produk di tiap baris: hanya barang proyek, hanya eceran, atau campuran.
export type GudangOrderSegment = "eceran" | "proyek" | "mixed";

export type GudangOrder = Omit<LocalOrder, "status"> & {
  status: GudangOrderStatus;
  processedAt?: string;
  segmen: GudangOrderSegment;
};

export interface GudangOrderDeduction {
  ok: boolean;
  sku: string;
  title: string;
  quantity: number;
  gudangItemId?: string;
  reason?: string;
}

export type GudangOrderResult =
  | { ok: true; order: GudangOrder }
  | { ok: false; code: "ORDER_NOT_FOUND" | "ORDER_STATUS_INVALID" };

export type GudangProcessResult =
  | { ok: true; order: GudangOrder; deductions: GudangOrderDeduction[] }
  | { ok: false; code: "ORDER_NOT_FOUND" | "ORDER_STATUS_INVALID" | "STOCK_NOT_ENOUGH" };
