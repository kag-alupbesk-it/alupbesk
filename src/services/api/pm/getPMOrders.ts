import { request } from "@/services/api/request";
import type { PMOrder } from "@/services/pm/types";

export function getPMOrders(): Promise<PMOrder[]> {
  return request("/pm/orders");
}
