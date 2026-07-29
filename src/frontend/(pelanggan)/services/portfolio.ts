import { portfolioItems, caseStudies, type PortfolioItem, type CaseStudy } from "@/services/portfolio";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  await delay(300);
  return portfolioItems;
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  await delay(300);
  return caseStudies;
}

export async function getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
  await delay(200);
  return portfolioItems.find((p) => p.id === id);
}

export async function getCaseStudy(id: number): Promise<CaseStudy | undefined> {
  await delay(200);
  return caseStudies.find((c) => c.id === id);
}
