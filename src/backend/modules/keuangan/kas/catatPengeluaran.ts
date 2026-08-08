import { pengeluaran } from "./store";
import type { KasEntry, KasResult } from "../types";

export function catatPengeluaran(input: {
  deskripsi: string;
  jumlah: number;
}): KasResult {
  const jumlah = Number(input.jumlah);
  if (!Number.isFinite(jumlah) || jumlah <= 0) {
    return { ok: false, code: "INVALID_AMOUNT" };
  }
  const id = `keu-keluar-${pengeluaran.size + 1}-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const entry: KasEntry = {
    id,
    tipe: "keluar",
    sumber: "Manual",
    deskripsi: input.deskripsi.trim(),
    jumlah,
    kategori: "operasional",
    tanggal: createdAt.slice(0, 10),
    createdAt,
  };
  pengeluaran.set(id, entry);
  return { ok: true, entry };
}
