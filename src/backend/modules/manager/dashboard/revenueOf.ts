import type { OrderStatus } from "@/services/orders/index";
import { isRevenueStatus } from "../helpers/index";

interface RevenueOrder {
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export function revenueOf(list: RevenueOrder[]): number {
  return list
    .filter((order) => isRevenueStatus(order.status))
    .reduce((sum, order) => sum + order.total, 0);
}
