import type { PaymentStatus } from "../types";

// Status pembayaran per pesanan, key = id pesanan (ord-*/prj-*).
// Default (belum tercatat) = "belum_bayar".
export const pembayaran = new Map<string, PaymentStatus>();
