import type { OrderStatus } from "@/services/orders/index";

const REVENUE_STATUSES: OrderStatus[] = ["confirmed", "processing", "completed"];

export function isRevenueStatus(status: OrderStatus): boolean {
  return REVENUE_STATUSES.includes(status);
}
