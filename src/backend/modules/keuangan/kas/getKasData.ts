import { getLocalOrders } from "@/services/orders";
import { getCatalogProduct } from "@/services/catalog";
import { getGudangItems, getProjectOrders } from "@/backend/modules/gudang";
import { isRevenueStatus } from "@/backend/modules/manager/helpers";
import { pengeluaran } from "./store";
import type { KasData, KasEntry, KasKategori } from "../types";

// Pemasukan otomatis dari pesanan: pesanan checkout (eceran/proyek menurut
// SKU item gudang) + pesanan proyek yang sudah diproses/dikirim.
function buildMasuk(): KasEntry[] {
  const gudangItems = getGudangItems();
  const entries: KasEntry[] = [];

  for (const order of getLocalOrders()) {
    if (!isRevenueStatus(order.status)) continue;
    let kategori: KasKategori = "eceran";
    for (const line of order.items) {
      const product = getCatalogProduct(line.productId);
      const sku = product?.sku ?? "";
      const item = gudangItems.find((gudangItem) => gudangItem.sku === sku);
      if (item?.kategoriBarang === "proyek") kategori = "proyek";
    }
    entries.push({
      id: `masuk-${order.id}`,
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
    entries.push({
      id: `masuk-${order.id}`,
      tipe: "masuk",
      sumber: `Pesanan proyek ${order.id}`,
      deskripsi: `Pembayaran proyek ${order.namaProyek} dari ${order.pelanggan}`,
      jumlah: order.totalQuantity * 100000,
      kategori: "proyek",
      tanggal: order.processedAt?.slice(0, 10) ?? order.createdAt.slice(0, 10),
      createdAt: order.processedAt ?? order.createdAt,
    });
  }

  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getKasData(): KasData {
  const masuk = buildMasuk();
  const keluar = [...pengeluaran.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalMasuk = masuk.reduce((sum, entry) => sum + entry.jumlah, 0);
  const totalKeluar = keluar.reduce((sum, entry) => sum + entry.jumlah, 0);
  return { totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar, masuk, keluar };
}
