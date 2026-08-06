import { marketingBanners } from "./store";
import type { MarketingBanner } from "../types";
export function getMarketingBanners(): MarketingBanner[] {
  return [...marketingBanners.values()].sort((a, b) => a.order - b.order);
}
