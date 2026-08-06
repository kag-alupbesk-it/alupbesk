import { getCatalogProducts } from "@/services/catalog";
import type { MarketingProduct } from "./types";

export function getMarketingProducts(): MarketingProduct[] {
  return getCatalogProducts();
}
