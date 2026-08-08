import { request } from "@/services/api/request";
import type { PenagihanItem } from "@/backend/modules/keuangan";

export function fetchPenagihan(): Promise<PenagihanItem[]> {
  return request<PenagihanItem[]>("/keuangan/penagihan");
}

export function setLunas(id: string): Promise<PenagihanItem> {
  return request<PenagihanItem>(`/keuangan/penagihan/${encodeURIComponent(id)}/lunas`, { method: "POST" });
}
