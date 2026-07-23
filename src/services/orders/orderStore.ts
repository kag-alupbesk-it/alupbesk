import type { LocalOrder, OrderStatusEvent } from "./types";

const orders = new Map<string, LocalOrder>();
const listeners = new Map<string, Set<(event: OrderStatusEvent) => void>>();

export function readOrder(id: string): LocalOrder | undefined { return orders.get(id); }
export function writeOrder(order: LocalOrder): void { orders.set(order.id, order); }
export function listenOrder(id: string, listener: (event: OrderStatusEvent) => void): () => void {
  const orderListeners = listeners.get(id) ?? new Set<(event: OrderStatusEvent) => void>();
  orderListeners.add(listener);
  listeners.set(id, orderListeners);
  return () => orderListeners.delete(listener);
}
export function emitOrder(event: OrderStatusEvent): void { listeners.get(event.orderId)?.forEach((listener) => listener(event)); }
