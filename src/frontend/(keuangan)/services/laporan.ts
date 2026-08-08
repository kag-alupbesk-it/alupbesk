import { request } from "@/services/api/request";
import type { FinancialsData } from "@/backend/modules/manager";
import type { Period } from "@/frontend/(keuangan)/types";

export function fetchLaporanKeuangan(period: Period = "monthly"): Promise<FinancialsData> {
  return request<FinancialsData>(`/keuangan/laporan?period=${period}`);
}
