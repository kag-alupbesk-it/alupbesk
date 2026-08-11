import { persistMarketingBanner, marketingBanners } from "./store";
import type { MarketingBanner, MarketingBannerInput } from "../types";
export function updateMarketingBanner(
  id: string,
  input: MarketingBannerInput,
): MarketingBanner | undefined {
  const current = marketingBanners.get(id);
  if (!current) return undefined;
  const banner = {
    id,
    ...input,
    title: input.title.trim(),
    createdAt: current.createdAt,
  };
  persistMarketingBanner(banner);
  return banner;
}
