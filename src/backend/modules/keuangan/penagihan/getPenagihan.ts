import { getLocalOrders } from "@/services/orders";
import { isRevenueStatus } from "@/backend/modules/manager/helpers";
import { pembayaran } from "./store";
import type { PenagihanItem, PaymentStatus } from "../types";

// Tagihan dibangun dari pesanan pelanggan yang dianggap menghasilkan
// pendapatan (revenue status).
export function getPenagihan(): PenagihanItem[] {
  const items: PenagihanItem[] = [];
  const statusOf = (id: string): PaymentStatus => pembayaran.get(id) ?? "belum_bayar";

  for (const order of getLocalOrders()) {
    if (!isRevenueStatus(order.status)) continue;
    items.push({
      id: order.id,
      sumber: "Pesanan Gudang",
      pelanggan: order.customer.name,
      nilai: order.total,
      status: statusOf(order.id),
      kategori: "eceran",
      tanggal: order.createdAt.slice(0, 10),
    });
  }

  return items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}
