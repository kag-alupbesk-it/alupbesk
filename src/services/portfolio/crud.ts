import { portfolioItems, caseStudies, persistPortfolioItem, deletePortfolioItem, persistCaseStudy, deleteCaseStudy } from "./store";
import type { PortfolioItem, PortfolioItemInput, CaseStudy, CaseStudyInput } from "./data";

function nextId(items: Map<number, unknown>): number {
  let max = 0;
  for (const id of items.keys()) {
    if (id > max) max = id;
  }
  return max + 1;
}

export function createPortfolioItem(input: PortfolioItemInput): PortfolioItem {
  const { img, year, ...rest } = input;
  const item: PortfolioItem = { id: nextId(portfolioItems), img: img ?? "", year: year ?? 0, ...rest };
  persistPortfolioItem(item);
  return item;
}

export function updatePortfolioItem(id: number, input: Partial<PortfolioItemInput>): PortfolioItem | undefined {
  const current = portfolioItems.get(id);
  if (!current) return undefined;
  const { img, year, ...rest } = input;
  const item: PortfolioItem = { ...current, ...rest, img: img ?? current.img, year: year ?? current.year, id };
  persistPortfolioItem(item);
  return item;
}

export function deletePortfolioItemById(id: number): boolean {
  return deletePortfolioItem(id);
}

export function createCaseStudy(input: CaseStudyInput): CaseStudy {
  const { img, year, ...rest } = input;
  const study: CaseStudy = { id: nextId(caseStudies), img: img ?? "", year: year ?? 0, ...rest };
  persistCaseStudy(study);
  return study;
}

export function updateCaseStudy(id: number, input: Partial<CaseStudyInput>): CaseStudy | undefined {
  const current = caseStudies.get(id);
  if (!current) return undefined;
  const { img, year, ...rest } = input;
  const study: CaseStudy = { ...current, ...rest, img: img ?? current.img, year: year ?? current.year, id };
  persistCaseStudy(study);
  return study;
}

export function deleteCaseStudyById(id: number): boolean {
  return deleteCaseStudy(id);
}
