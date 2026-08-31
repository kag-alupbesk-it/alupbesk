export interface PortfolioItem {
  id: number;
  client: string;
  industry: string;
  title: string;
  challenge: string;
  solution: string;
  result: string;
  img: string;
  tags: string[];
  year: number;
}

export interface CaseStudy {
  id: number;
  client: string;
  logo: string; // initial/abbrev untuk placeholder
  industry: string;
  title: string;
  desc: string;
  metrics: { label: string; value: string }[];
  img: string;
  year: number;
}

export type PortfolioItemInput = Omit<PortfolioItem, "id" | "img" | "year"> & { img?: string; year?: number };
export type CaseStudyInput = Omit<CaseStudy, "id" | "img" | "year"> & { img?: string; year?: number };
