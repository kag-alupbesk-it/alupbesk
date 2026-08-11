import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { LocalOrder, OrderLine, OrderStatusEvent } from "./types";

const orders = new Map<string, LocalOrder>();
const listeners = new Map<string, Set<(event: OrderStatusEvent) => void>>();

function orderToRow(order: LocalOrder): Record<string, unknown> {
  return {
    id: order.id,
    status: order.status,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || null,
    customer_address: order.customer.address,
    customer_note: order.customer.note || null,
    total: order.total,
    manager_decision_at: order.managerDecisionAt ?? null,
    manager_rejection_reason: order.managerRejectionReason ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function lineToRow(orderId: string, line: OrderLine): Record<string, unknown> {
  return {
    order_id: orderId,
    product_id: line.productId,
    quantity: line.quantity,
    variants: line.variants ?? null,
    note: line.note ?? null,
    title: line.title,
    unit_price: line.unitPrice,
    subtotal: line.subtotal,
  };
}

export function readOrder(id: string): LocalOrder | undefined { return orders.get(id); }
export function readOrders(): LocalOrder[] { return [...orders.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt)); }
export function writeOrder(order: LocalOrder): void {
  orders.set(order.id, order);
  enqueueUpsert("orders", orderToRow(order), "id");
  enqueueDelete("order_lines", "order_id", order.id);
  for (const line of order.items) {
    enqueueUpsert("order_lines", lineToRow(order.id, line));
  }
}
export function listenOrder(id: string, listener: (event: OrderStatusEvent) => void): () => void {
  const orderListeners = listeners.get(id) ?? new Set<(event: OrderStatusEvent) => void>();
  orderListeners.add(listener);
  listeners.set(id, orderListeners);
  return () => orderListeners.delete(listener);
}
export function emitOrder(event: OrderStatusEvent): void { listeners.get(event.orderId)?.forEach((listener) => listener(event)); }
