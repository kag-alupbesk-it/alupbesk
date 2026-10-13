import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { ProductionRequest } from "./types";

// Permintaan produksi diisi dari Supabase saat hydrate dan dari pengajuan
// divisi produksi. Kosong berarti belum ada data.
export const productionRequests = new Map<string, ProductionRequest>();

// Menyimpan permintaan ke memori sekaligus sinkron ke Supabase
// (tabel gudang_production_requests + gudang_production_request_items).
export function persistProductionRequest(request: ProductionRequest): void {
  productionRequests.set(request.id, request);
  enqueueUpsert(
    "gudang_production_requests",
    {
      id: request.id,
      request_date: request.requestDate,
      spk_ref: request.spkRef,
      spk_label: request.spkLabel,
      requester_name: request.requesterName,
      note: request.note,
      status: request.status,
      approved_by: request.approvedBy ?? null,
      approved_at: request.approvedAt ?? null,
      reject_reason: request.rejectReason ?? null,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
    },
    "id",
  );
  enqueueDelete("gudang_production_request_items", "request_id", request.id);
  for (const item of request.items) {
    enqueueUpsert(
      "gudang_production_request_items",
      {
        id: item.id,
        request_id: request.id,
        item_id: item.itemId,
        category_id: item.categoryId,
        category_name: item.categoryName,
        item_name: item.itemName,
        model_no: item.modelNo,
        brand: item.brand,
        color: item.color,
        rack_group: item.rackGroup,
        sub_row: item.subRow,
        quantity: item.quantity,
      },
      "id",
    );
  }
}
