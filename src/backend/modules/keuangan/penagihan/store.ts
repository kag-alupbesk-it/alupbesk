import { enqueueUpsert } from "@/services/supabase";
import type { PaymentStatus } from "../types";

// Status pembayaran per pesanan, key = id pesanan (ord-*/prj-*).
// Default (belum tercatat) = "belum_bayar".
export const pembayaran = new Map<string, PaymentStatus>();

// Menyimpan status bayar ke memori sekaligus mengantrekan tulis ke Supabase.
export function persistPembayaran(orderId: string, status: PaymentStatus): void {
  pembayaran.set(orderId, status);
  enqueueUpsert(
    "penagihan",
    {
      order_id: orderId,
      order_type: orderId.startsWith("prj-") ? "proyek" : "pesanan",
      status,
      updated_at: new Date().toISOString(),
    },
    "order_id",
  );
}
