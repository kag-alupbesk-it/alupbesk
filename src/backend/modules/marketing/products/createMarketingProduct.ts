import { createProduct } from "@/services/catalog";
import type { MarketingProduct, MarketingProductInput } from "./types";

export function createMarketingProduct(input: MarketingProductInput): MarketingProduct {
  return createProduct(input);
}
