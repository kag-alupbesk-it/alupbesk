import { getFinancialsData } from "@/backend/modules/manager";
import type { FinancialsData } from "@/backend/modules/manager";

export function getLaporanKeuangan(period = "monthly", opts?: { startDate?: string; endDate?: string }): FinancialsData {
  return getFinancialsData(period, opts);
}
