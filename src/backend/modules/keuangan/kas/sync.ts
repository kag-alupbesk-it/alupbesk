import { getLocalOrders } from "@/services/orders";
import { isRevenueStatus } from "@/backend/modules/manager/helpers";
import { persistKasEntry, kasEntries } from "./store";

// Menambahkan pemasukan otomatis dari pesanan yang disetujui ke buku kas,
// hanya untuk id yang belum tercatat — jadi entry yang sudah dikoreksi/
// dihapus admin tidak dibuat ulang oleh sinkronisasi ini.
export function syncKasDariPesanan(): void {
  for (const order of getLocalOrders()) {
    if (!isRevenueStatus(order.status)) continue;
    const id = `masuk-${order.id}`;
    if (kasEntries.has(id)) continue;
    persistKasEntry({
      id,
      tipe: "masuk",
      sumber: `Pesanan ${order.id}`,
      deskripsi: `Pembayaran dari ${order.customer.name}`,
      jumlah: order.total,
      kategori: "eceran",
      tanggal: order.createdAt.slice(0, 10),
      createdAt: order.createdAt,
    });
  }
}
