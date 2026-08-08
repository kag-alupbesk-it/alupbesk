import { kasEntries, seedKasEntries } from "./store";
import type { KasEntry, KasEntryInput, KasResult } from "../types";

export function createKasEntry(input: KasEntryInput): KasResult {
  seedKasEntries();
  const jumlah = Math.round(Number(input.jumlah));
  if (!Number.isFinite(jumlah) || jumlah <= 0) return { ok: false, code: "INVALID_AMOUNT" };
  if (!input.deskripsi.trim()) return { ok: false, code: "INVALID_INPUT" };

  const createdAt = new Date().toISOString();
  const entry: KasEntry = {
    id: `keu-${input.tipe === "masuk" ? "masuk" : "keluar"}-${kasEntries.size + 1}-${Date.now()}`,
    tipe: input.tipe,
    sumber: input.tipe === "masuk" ? "Pencatatan manual" : "Manual",
    deskripsi: input.deskripsi.trim(),
    jumlah,
    kategori: input.kategori,
    tanggal: input.tanggal || createdAt.slice(0, 10),
    createdAt,
  };
  kasEntries.set(entry.id, entry);
  return { ok: true, entry };
}
