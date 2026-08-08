import { request } from "@/services/api/request";
import type { KasData, KasEntry } from "@/backend/modules/keuangan";

export interface CatatPengeluaranInput {
  deskripsi: string;
  jumlah: number;
}

export function fetchKas(): Promise<KasData> {
  return request<KasData>("/keuangan/kas");
}

export function catatPengeluaran(input: CatatPengeluaranInput): Promise<KasEntry> {
  return request<KasEntry>("/keuangan/kas", { method: "POST", body: JSON.stringify(input) });
}
