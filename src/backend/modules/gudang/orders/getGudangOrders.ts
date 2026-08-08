import { getLocalOrders } from "@/services/orders";
import type { GudangOrder, GudangOrderStatus } from "./types";
import { computeOrderSegment } from "./segment";

const GUDANG_STATUSES: GudangOrderStatus[] = ["confirmed", "processing", "completed"];

// Pesanan yang relevan untuk gudang: yang sudah disetujui manajer, sedang
// diproses, atau sudah selesai dikirim. Segmen dihitung dari SKU tiap baris.
export function getGudangOrders(): GudangOrder[] {
  return getLocalOrders()
    .filter((order) => (GUDANG_STATUSES as string[]).includes(order.status))
    .map((order) => ({
      ...order,
      status: order.status as GudangOrderStatus,
      segmen: computeOrderSegment(order),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
