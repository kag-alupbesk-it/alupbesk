import type { MarketingBanner, MarketingBannerInput, MarketingOrder, MarketingProduct, MarketingProductInput, MarketingReport } from "@/backend/modules/marketing";
import { request } from "../request";
export const marketingApi = {
  getBanners: (): Promise<MarketingBanner[]> => request("/marketing/banners"),
  createBanner: (input: MarketingBannerInput): Promise<MarketingBanner> => request("/marketing/banners", { method: "POST", body: JSON.stringify(input) }),
  updateBanner: (id: string, input: MarketingBannerInput): Promise<MarketingBanner> => request(`/marketing/banners/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteBanner: (id: string): Promise<void> => request(`/marketing/banners/${id}`, { method: "DELETE" }),
  getOrders: (): Promise<MarketingOrder[]> => request("/marketing/orders"),
  submitOrder: (id: string): Promise<MarketingOrder> => request(`/marketing/orders/${id}/submit`, { method: "POST" }),
  getReport: (): Promise<MarketingReport> => request("/marketing/reports"),
  getProducts: (): Promise<MarketingProduct[]> => request("/marketing/products"),
  createProduct: (input: MarketingProductInput): Promise<MarketingProduct> => request("/marketing/products", { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: number, input: Partial<MarketingProductInput>): Promise<MarketingProduct> => request(`/marketing/products/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteProduct: (id: number): Promise<void> => request(`/marketing/products/${id}`, { method: "DELETE" }),
};
