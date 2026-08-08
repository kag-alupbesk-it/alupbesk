import type { GudangMovement } from "./types";

// Riwayat pergerakan barang (masuk & keluar). Masih in-memory seperti store gudang
// lainnya; akan digantikan tabel gudang_movements saat Supabase aktif.
export const gudangMovements = new Map<string, GudangMovement>();

export function generateMovementId(): string {
  return `mv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
