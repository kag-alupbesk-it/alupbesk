import { marketingBanners } from "./store";
export function deleteMarketingBanner(id: string): boolean {
  return marketingBanners.delete(id);
}
