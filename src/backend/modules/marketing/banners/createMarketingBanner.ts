import { persistMarketingBanner } from "./store";
import type { MarketingBanner, MarketingBannerInput } from "../types";
export function createMarketingBanner(
  input: MarketingBannerInput,
): MarketingBanner {
  const banner = {
    id: crypto.randomUUID(),
    ...input,
    title: input.title.trim(),
    createdAt: new Date().toISOString(),
  };
  persistMarketingBanner(banner);
  return banner;
}
