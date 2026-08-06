import { request } from "@/services/api/request";
import type { LocalOrder } from "@/services/orders";

export type ManagerDecision = "confirmed" | "rejected_by_manager";

export function getOrders(): Promise<LocalOrder[]> {
  return request<LocalOrder[]>("/manager/orders");
}

export function decideOrder(
  id: string,
  decision: ManagerDecision,
  reason?: string
): Promise<LocalOrder> {
  return request<LocalOrder>(`/manager/orders/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}
