import type { CaseStudy, PortfolioItem } from "@/services/portfolio";
import { request } from "../request";
export interface PortfolioResponse { items: PortfolioItem[]; caseStudies: CaseStudy[]; }
export const portfolioApi = { getAll: (): Promise<PortfolioResponse> => request("/portfolio") };
