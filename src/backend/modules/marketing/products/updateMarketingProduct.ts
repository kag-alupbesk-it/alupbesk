import { updateProduct } from "@/services/catalog";
import type { MarketingProduct, MarketingProductInput } from "./types";

export function updateMarketingProduct(id: number, input: Partial<MarketingProductInput>): MarketingProduct | undefined {
  return updateProduct(id, input);
}
