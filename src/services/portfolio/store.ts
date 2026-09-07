import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { PortfolioItem, CaseStudy } from "./data";

export interface PortfolioData {
  items: PortfolioItem[];
  caseStudies: CaseStudy[];
}

export const portfolioItems = new Map<number, PortfolioItem>();
export const caseStudies = new Map<number, CaseStudy>();

export function getPortfolioData(): PortfolioData {
  return {
    items: [...portfolioItems.values()].sort((a, b) => a.year - b.year),
    caseStudies: [...caseStudies.values()].sort((a, b) => a.year - b.year),
  };
}

export function persistPortfolioItem(item: PortfolioItem): void {
  portfolioItems.set(item.id, item);
  enqueueUpsert(
    "portfolio_items",
    {
      id: item.id,
      client: item.client,
      industry: item.industry,
      title: item.title,
      challenge: item.challenge,
      solution: item.solution,
      result: item.result,
      img: item.img,
      tags: item.tags,
      year: item.year ?? null,
    },
    "id",
  );
}

export function deletePortfolioItem(id: number): boolean {
  const deleted = portfolioItems.delete(id);
  if (deleted) enqueueDelete("portfolio_items", "id", String(id));
  return deleted;
}

export function persistCaseStudy(study: CaseStudy): void {
  caseStudies.set(study.id, study);
  enqueueUpsert(
    "case_studies",
    {
      id: study.id,
      client: study.client,
      logo: study.logo,
      industry: study.industry,
      title: study.title,
      description: study.desc,
      metrics: study.metrics,
      img: study.img,
      year: study.year ?? null,
    },
    "id",
  );
}

export function deleteCaseStudy(id: number): boolean {
  const deleted = caseStudies.delete(id);
  if (deleted) enqueueDelete("case_studies", "id", String(id));
  return deleted;
}
