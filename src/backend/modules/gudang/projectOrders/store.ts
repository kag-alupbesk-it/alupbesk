import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { ProjectOrder } from "./types";

// Pesanan proyek diisi dari database (Supabase) saat hydrate. Kosong berarti
// belum ada data; data hanya muncul ketika dibuat oleh admin.
export const projectOrders = new Map<string, ProjectOrder>();

// Menyimpan pesanan proyek ke memori sekaligus sinkron ke Supabase
// (tabel project_orders + project_order_items).
export function persistProjectOrder(order: ProjectOrder): void {
  projectOrders.set(order.id, order);
  enqueueUpsert(
    "project_orders",
    {
      id: order.id,
      request_id: order.requestId ?? null,
      nama_proyek: order.namaProyek,
      pelanggan: order.pelanggan,
      perusahaan: order.perusahaan ?? null,
      telepon: order.telepon ?? null,
      catatan: order.catatan ?? null,
      total_quantity: order.totalQuantity,
      status: order.status,
      processed_at: order.processedAt ?? null,
      completed_at: order.completedAt ?? null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    },
    "id",
  );
  enqueueDelete("project_order_items", "project_order_id", order.id);
  for (const item of order.items) {
    enqueueUpsert(
      "project_order_items",
      {
        project_order_id: order.id,
        gudang_item_id: item.gudangItemId,
        sku: item.sku,
        jenis_barang: item.jenisBarang,
        merek: item.merek ?? null,
        warna: item.warna ?? null,
        satuan: item.satuan ?? null,
        quantity: item.quantity,
      },
    );
  }
}
