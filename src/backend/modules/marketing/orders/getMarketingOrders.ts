import { getLocalOrders } from "@/services/orders";
import type { MarketingOrder, MarketingOrderStatus } from "../types";
export function getMarketingOrders(): MarketingOrder[] {
  return getLocalOrders().map((order) => ({
    ...order,
    status: order.status as MarketingOrderStatus,
  }));
}
