import type { KasData, KasEntry, PenagihanItem } from "@/backend/modules/keuangan";
import type { FinancialsData } from "@/backend/modules/manager";
import { request } from "../request";

export interface CatatKasInput {
  tipe: "masuk" | "keluar";
  deskripsi: string;
  jumlah: number;
  kategori: "eceran" | "proyek" | "operasional";
  tanggal?: string;
}

export const KATEGORI_KAS = ["eceran", "proyek", "operasional"] as const;

export const keuanganApi = {
  getKas: (): Promise<KasData> => request("/keuangan/kas"),
  tambahKas: (input: CatatKasInput): Promise<KasEntry> =>
    request("/keuangan/kas", { method: "POST", body: JSON.stringify(input) }),
  hapusKas: (id: string): Promise<KasEntry> =>
    request(`/keuangan/kas/${encodeURIComponent(id)}`, { method: "DELETE" }),
  getPenagihan: (): Promise<PenagihanItem[]> => request("/keuangan/penagihan"),
  setLunas: (id: string): Promise<PenagihanItem> =>
    request(`/keuangan/penagihan/${encodeURIComponent(id)}/lunas`, { method: "POST" }),
  getLaporan: (period = "monthly"): Promise<FinancialsData> =>
    request(`/keuangan/laporan?period=${encodeURIComponent(period)}`),
};
