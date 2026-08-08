import { getLocalOrders } from "@/services/orders";
import { getCatalogProduct } from "@/services/catalog";
import { getGudangItems, getProjectOrders } from "@/backend/modules/gudang";
import { isRevenueStatus } from "@/backend/modules/manager/helpers";
import { kasEntries } from "./store";
import type { KasKategori } from "../types";

// Menambahkan pemasukan otomatis dari pesanan yang disetujui ke buku kas,
// hanya untuk id yang belum tercatat — jadi entry yang sudah dikoreksi/
// dihapus admin tidak dibuat ulang oleh sinkronisasi ini.
export function syncKasDariPesanan(): void {
  const gudangItems = getGudangItems();

  for (const order of getLocalOrders()) {
    if (!isRevenueStatus(order.status)) continue;
    const id = `masuk-${order.id}`;
    if (kasEntries.has(id)) continue;
    let kategori: KasKategori = "eceran";
    for (const line of order.items) {
      const product = getCatalogProduct(line.productId);
      const item = gudangItems.find((gudangItem) => gudangItem.sku === product?.sku);
      if (item?.kategoriBarang === "proyek") kategori = "proyek";
    }
    kasEntries.set(id, {
      id,
      tipe: "masuk",
      sumber: `Pesanan ${order.id}`,
      deskripsi: `Pembayaran dari ${order.customer.name}`,
      jumlah: order.total,
      kategori,
      tanggal: order.createdAt.slice(0, 10),
      createdAt: order.createdAt,
    });
  }

  for (const order of getProjectOrders()) {
    if (order.status === "diajukan") continue;
    const id = `masuk-${order.id}`;
    if (kasEntries.has(id)) continue;
    kasEntries.set(id, {
      id,
      tipe: "masuk",
      sumber: `Pesanan proyek ${order.id}`,
      deskripsi: `Pembayaran proyek ${order.namaProyek} dari ${order.pelanggan}`,
      jumlah: order.totalQuantity * 100000,
      kategori: "proyek",
      tanggal: order.processedAt?.slice(0, 10) ?? order.createdAt.slice(0, 10),
      createdAt: order.processedAt ?? order.createdAt,
    });
  }
}
