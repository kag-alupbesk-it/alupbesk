import { publishOrderStatus } from "@/services/orders";
import type { MarketingOrder } from "../types";

export function submitOrderToManager(id: string): MarketingOrder | undefined {
  const now = new Date().toISOString();
  // Waktu konfirmasi marketing & pengiriman ke manager disimpan sekarang juga
  // supaya timeline riwayat pesanan punya jejak yang lengkap.
  const updated = publishOrderStatus(id, "submitted_to_manager", {
    marketingConfirmedAt: now,
    submittedToManagerAt: now,
  });
  if (!updated) return undefined;
  return {
    ...updated,
    status: "submitted_to_manager",
  };
}
