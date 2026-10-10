import { emitOrder, readOrder, writeOrder } from "./orderStore";
import { notifyOrderStatusChange } from "@/services/push/orderNotifications";
import type { LocalOrder, OrderStatus } from "./types";

export function publishOrderStatus(
  id: string,
  status: OrderStatus,
  extras: Pick<LocalOrder, "managerDecisionAt" | "managerRejectionReason"> = {}
): LocalOrder | undefined {
  const current = readOrder(id);
  if (!current) return undefined;
  const updated: LocalOrder = {
    ...current,
    ...extras,
    status,
    updatedAt: new Date().toISOString(),
  };
  writeOrder(updated);
  emitOrder({ orderId: id, status, updatedAt: updated.updatedAt });
  notifyOrderStatusChange(updated, status);
  return updated;
}
