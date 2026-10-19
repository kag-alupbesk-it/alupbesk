import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { CustomRequest } from "./types";

export const customRequests = new Map<string, CustomRequest>();

// Menyimpan request ke memori sekaligus mengantrekan tulis ke Supabase
// (tabel custom_requests + custom_request_items, pola gudang_production_request_items).
export function persistCustomRequest(request: CustomRequest): void {
  customRequests.set(request.id, request);
  enqueueUpsert(
    "custom_requests",
    {
      id: request.id,
      nama: request.nama,
      kode: request.kode ?? null,
      perusahaan: request.perusahaan ?? null,
      email: request.email ?? null,
       telp: request.telp,
       project_address: request.projectAddress ?? null,
       provinsi: request.provinsi ?? null,
       kabupaten: request.kabupaten ?? null,
       layanan: request.layanan,
      deskripsi: request.deskripsi,
      deadline: request.deadline ?? null,
      raw_image: request.rawImage ?? null,
      raw_image_name: request.rawImageName ?? null,
      source: request.source,
      status: request.status,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
    },
    "id",
  );
  enqueueDelete("custom_request_items", "request_id", request.id);
  for (const item of request.items) {
    enqueueUpsert(
      "custom_request_items",
      {
        id: item.id,
        request_id: request.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        technical_note: item.technicalNote,
        sort_order: item.sortOrder,
      },
      "id",
    );
  }
}