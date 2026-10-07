import type { GudangMovement } from "./types";

// Riwayat pergerakan barang (masuk & keluar), disimpan di memori dan Supabase.
export const gudangMovements = new Map<string, GudangMovement>();
