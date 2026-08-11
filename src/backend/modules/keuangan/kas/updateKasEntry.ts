import { persistKasEntry, kasEntries } from "./store";
import type { KasEntryInput, KasResult } from "../types";

export function updateKasEntry(id: string, input: KasEntryInput): KasResult {
  const existing = kasEntries.get(id);
  if (!existing) return { ok: false, code: "KAS_ENTRY_NOT_FOUND" };

  const jumlah = Math.round(Number(input.jumlah));
  if (!Number.isFinite(jumlah) || jumlah <= 0) return { ok: false, code: "INVALID_AMOUNT" };
  if (!input.deskripsi.trim()) return { ok: false, code: "INVALID_INPUT" };

  const updated = {
    ...existing,
    tipe: input.tipe,
    deskripsi: input.deskripsi.trim(),
    jumlah,
    kategori: input.kategori,
    tanggal: input.tanggal || existing.tanggal,
  };
  persistKasEntry(updated);
  return { ok: true, entry: updated };
}
