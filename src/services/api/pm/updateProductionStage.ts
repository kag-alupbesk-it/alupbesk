import { updatePMOrder } from "./updatePMOrder";
import type { PMOrder, PMProductionStage } from "@/services/pm/types";

export function updateProductionStage(
  orderId: string,
  stage: PMProductionStage,
): Promise<PMOrder> {
  return updatePMOrder(orderId, { action: "production-stage", stage });
}
