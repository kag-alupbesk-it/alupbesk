import { getLocalOrders } from "@/services/orders";
import { getCatalogProduct } from "@/services/catalog";
import { getGudangItems, getProjectOrders } from "@/backend/modules/gudang";
import { isRevenueStatus } from "@/backend/modules/manager/helpers";
import { pembayaran } from "./store";
import type { KasKategori, PenagihanItem, PaymentStatus } from "../types";

// Tagihan dibangun dari pesanan yang dianggap menghasilkan pendapatan:
// pesanan checkout (revenue status) + pesanan proyek yang sudah diproses.
export function getPenagihan(): PenagihanItem[] {
  const gudangItems = getGudangItems();
  const items: PenagihanItem[] = [];
  const statusOf = (id: string): PaymentStatus => pembayaran.get(id) ?? "belum_bayar";

  for (const order of getLocalOrders()) {
    if (!isRevenueStatus(order.status)) continue;
    let kategori: KasKategori = "eceran";
    for (const line of order.items) {
      const product = getCatalogProduct(line.productId);
      const item = gudangItems.find((g) => g.sku === product?.sku);
      if (item?.kategoriBarang === "proyek") kategori = "proyek";
    }
    items.push({
      id: order.id,
      sumber: "Pesanan Gudang",
      pelanggan: order.customer.name,
      nilai: order.total,
      status: statusOf(order.id),
      kategori,
      tanggal: order.createdAt.slice(0, 10),
    });
  }

  for (const order of getProjectOrders()) {
    if (order.status === "diajukan") continue;
    items.push({
      id: order.id,
      sumber: "Pesanan Proyek",
      pelanggan: order.pelanggan,
      nilai: order.totalQuantity * 100000,
      status: statusOf(order.id),
      kategori: "proyek",
      tanggal: order.processedAt?.slice(0, 10) ?? order.createdAt.slice(0, 10),
    });
  }

  return items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}
