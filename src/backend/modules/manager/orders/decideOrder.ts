import { publishOrderStatus } from "@/services/orders";
import type { LocalOrder } from "@/services/orders";

export type ManagerDecision = "confirmed" | "rejected_by_manager";

export const MANAGER_DECISIONS: ManagerDecision[] = ["confirmed", "rejected_by_manager"];

export function decideOrder(
  id: string,
  decision: ManagerDecision,
  reason?: string
): LocalOrder | undefined {
  const now = new Date().toISOString();
  if (decision === "rejected_by_manager") {
    const reasonText = reason?.trim();
    if (!reasonText) return undefined;
    return publishOrderStatus(id, decision, {
      managerDecisionAt: now,
      managerRejectionReason: reasonText,
    });
  }
  return publishOrderStatus(id, decision, { managerDecisionAt: now });
}
