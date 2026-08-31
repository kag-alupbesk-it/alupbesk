import { portfolioItems } from "./store";
import type { PortfolioItem } from "./data";

export function getPortfolioItems(): PortfolioItem[] {
  return [...portfolioItems.values()].sort((a, b) => a.year - b.year);
}
