import { getFinancialsData } from "@/backend/modules/manager";
import type { FinancialsData } from "@/backend/modules/manager";

export function getLaporanKeuangan(period = "monthly"): FinancialsData {
  return getFinancialsData(period);
}
