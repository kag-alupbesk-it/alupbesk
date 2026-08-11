import { enqueueUpsert } from "@/services/supabase";
import type { CustomRequest } from "./types";

export const customRequests = new Map<string, CustomRequest>();

// Menyimpan request ke memori sekaligus mengantrekan tulis ke Supabase.
export function persistCustomRequest(request: CustomRequest): void {
  customRequests.set(request.id, request);
  enqueueUpsert(
    "custom_requests",
    {
      id: request.id,
      nama: request.nama,
      perusahaan: request.perusahaan ?? null,
      email: request.email ?? null,
      telp: request.telp,
      layanan: request.layanan,
      deskripsi: request.deskripsi,
      dimensi: request.dimensi ?? null,
      kuantitas: request.kuantitas ?? null,
      deadline: request.deadline ?? null,
      status: request.status,
      created_at: request.createdAt,
      updated_at: request.updatedAt,
    },
    "id",
  );
}
