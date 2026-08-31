import { caseStudies } from "./store";
import type { CaseStudy } from "./data";

export function getCaseStudies(): CaseStudy[] {
  return [...caseStudies.values()].sort((a, b) => a.year - b.year);
}
