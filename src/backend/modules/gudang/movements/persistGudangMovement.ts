import { enqueueUpsert } from "@/services/supabase";
import type { GudangMovement } from "./types";
import { gudangMovements } from "./store";

export function persistGudangMovement(movement: GudangMovement): void {
  gudangMovements.set(movement.id, movement);
  enqueueUpsert(
    "gudang_movements",
    {
      id: movement.id,
      item_id: movement.itemId,
      tipe: movement.tipe,
      jumlah: movement.jumlah,
      tanggal: movement.tanggal,
      sumber: movement.sumber ?? null,
      bukti_nota: movement.buktiNota ?? null,
      tujuan: movement.tujuan ?? null,
      penerima: movement.penerima ?? null,
      catatan: movement.catatan ?? null,
      stok_sebelum: movement.stokSebelum,
      stok_sesudah: movement.stokSesudah,
      created_at: movement.createdAt,
    },
    "id",
  );
}
