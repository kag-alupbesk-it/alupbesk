import { emitOrder, readOrder, writeOrder } from "./orderStore";
import type { LocalOrder, OrderStatus } from "./types";
export function publishOrderStatus(id: string, status: OrderStatus): LocalOrder | undefined {
  const current = readOrder(id); if (!current) return undefined;
  const updated = { ...current, status, updatedAt: new Date().toISOString() }; writeOrder(updated); emitOrder({ orderId: id, status, updatedAt: updated.updatedAt }); return updated;
}
