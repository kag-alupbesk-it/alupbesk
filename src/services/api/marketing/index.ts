import type { MarketingBanner, MarketingBannerInput, MarketingOrder, MarketingReport } from "@/backend/modules/pemasaran";
import { request } from "../request";
export const marketingApi = {
  getBanners: (): Promise<MarketingBanner[]> => request("/marketing/banners"),
  createBanner: (input: MarketingBannerInput): Promise<MarketingBanner> => request("/marketing/banners", { method: "POST", body: JSON.stringify(input) }),
  updateBanner: (id: string, input: MarketingBannerInput): Promise<MarketingBanner> => request(`/marketing/banners/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteBanner: (id: string): Promise<void> => request(`/marketing/banners/${id}`, { method: "DELETE" }),
  getOrders: (): Promise<MarketingOrder[]> => request("/marketing/orders"),
  submitOrder: (id: string): Promise<MarketingOrder> => request(`/marketing/orders/${id}/submit`, { method: "POST" }),
  getReport: (): Promise<MarketingReport> => request("/marketing/reports"),
};
