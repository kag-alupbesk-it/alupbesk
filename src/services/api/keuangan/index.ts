import type { KasData, KasEntry, PenagihanItem } from "@/backend/modules/keuangan";
import type { FinancialsData } from "@/backend/modules/manager";
import { request } from "../request";

export interface CatatPengeluaranInput {
  deskripsi: string;
  jumlah: number;
}

export const keuanganApi = {
  getKas: (): Promise<KasData> => request("/keuangan/kas"),
  catatPengeluaran: (input: CatatPengeluaranInput): Promise<KasEntry> =>
    request("/keuangan/kas", { method: "POST", body: JSON.stringify(input) }),
  getPenagihan: (): Promise<PenagihanItem[]> => request("/keuangan/penagihan"),
  setLunas: (id: string): Promise<PenagihanItem> =>
    request(`/keuangan/penagihan/${encodeURIComponent(id)}/lunas`, { method: "POST" }),
  getLaporan: (period = "monthly"): Promise<FinancialsData> =>
    request(`/keuangan/laporan?period=${encodeURIComponent(period)}`),
};
