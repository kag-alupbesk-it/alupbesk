import { request } from "@/services/api/request";
import type { MarketingOrder } from "@/backend/modules/marketing";

export function getPesanan(): Promise<MarketingOrder[]> {
  return request<MarketingOrder[]>("/owner/orders");
}