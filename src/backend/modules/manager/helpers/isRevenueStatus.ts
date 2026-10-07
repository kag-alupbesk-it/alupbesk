import type { OrderStatus } from "@/services/orders";

const REVENUE_STATUSES: OrderStatus[] = ["confirmed", "processing", "completed"];

export function isRevenueStatus(status: OrderStatus): boolean {
  return REVENUE_STATUSES.includes(status);
}
