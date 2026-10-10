import { request } from "@/services/api/request";
import type { MarketingOrder } from "@/backend/modules/marketing";

export function getPesanan(): Promise<MarketingOrder[]> {
  return request<MarketingOrder[]>("/owner/orders");
}

export function submitPesanan(id: string): Promise<MarketingOrder> {
  return request<MarketingOrder>(`/owner/orders/${encodeURIComponent(id)}/submit`, { method: "POST" });
}