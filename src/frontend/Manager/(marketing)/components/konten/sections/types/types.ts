import type {
  Partner,
  FaqItem,
  CustomService,
  PartnerInput,
  FaqItemInput,
  CustomServiceInput,
} from "@/backend/modules/content";
import type { PortfolioItem, CaseStudy } from "@/services/portfolio";

export interface PartnerFormData {
  name: string;
  initials: string;
  logoUrl: string;
  sortOrder: number;
  active: boolean;
}

export interface FaqFormData {
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}

export interface ServiceFormData {
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

export interface PortfolioItemFormData {
  client: string;
  industry: string;
  title: string;
  challenge: string;
  solution: string;
  result: string;
  img: string;
  tags: string;
  year: string;
}

export interface CaseStudyFormData {
  client: string;
  logo: string;
  industry: string;
  title: string;
  desc: string;
  metrics: string;
  img: string;
  year: string;
}

export const emptyPartnerForm = (): PartnerFormData => ({
  name: "",
  initials: "",
  logoUrl: "",
  sortOrder: 0,
  active: true,
});

export const emptyFaqForm = (): FaqFormData => ({
  question: "",
  answer: "",
  sortOrder: 0,
  active: true,
});

export const emptyServiceForm = (): ServiceFormData => ({
  icon: "build",
  title: "",
  description: "",
  sortOrder: 0,
  active: true,
});

export const emptyPortfolioItemForm = (): PortfolioItemFormData => ({
  client: "",
  industry: "",
  title: "",
  challenge: "",
  solution: "",
  result: "",
  img: "",
  tags: "",
  year: "",
});

export const emptyCaseStudyForm = (): CaseStudyFormData => ({
  client: "",
  logo: "",
  industry: "",
  title: "",
  desc: "",
  metrics: "",
  img: "",
  year: "",
});

export function partnerToForm(p: Partner): PartnerFormData {
  return {
    name: p.name,
    initials: p.initials,
    logoUrl: p.logoUrl ?? "",
    sortOrder: p.sortOrder,
    active: p.active,
  };
}

export function formToPartnerInput(f: PartnerFormData): PartnerInput {
  return {
    name: f.name.trim(),
    initials: f.initials.trim(),
    logoUrl: f.logoUrl.trim() || undefined,
    sortOrder: f.sortOrder,
    active: f.active,
  };
}

export function faqToForm(f: FaqItem): FaqFormData {
  return {
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
    active: f.active,
  };
}

export function formToFaqInput(f: FaqFormData): FaqItemInput {
  return {
    question: f.question.trim(),
    answer: f.answer.trim(),
    sortOrder: f.sortOrder,
    active: f.active,
  };
}

export function serviceToForm(s: CustomService): ServiceFormData {
  return {
    icon: s.icon,
    title: s.title,
    description: s.description,
    sortOrder: s.sortOrder,
    active: s.active,
  };
}

export function formToServiceInput(f: ServiceFormData): CustomServiceInput {
  return {
    icon: f.icon.trim(),
    title: f.title.trim(),
    description: f.description.trim(),
    sortOrder: f.sortOrder,
    active: f.active,
  };
}

export function portfolioItemToForm(p: PortfolioItem): PortfolioItemFormData {
  return {
    client: p.client,
    industry: p.industry,
    title: p.title,
    challenge: p.challenge,
    solution: p.solution,
    result: p.result,
    img: p.img,
    tags: p.tags.join(", "),
    year: p.year ? String(p.year) : "",
  };
}

export function formToPortfolioItemInput(f: PortfolioItemFormData) {
  return {
    client: f.client.trim(),
    industry: f.industry.trim(),
    title: f.title.trim(),
    challenge: f.challenge.trim(),
    solution: f.solution.trim(),
    result: f.result.trim(),
    img: f.img.trim() || undefined,
    tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
    year: f.year ? parseInt(f.year, 10) : undefined,
  };
}

export function caseStudyToForm(s: CaseStudy): CaseStudyFormData {
  return {
    client: s.client,
    logo: s.logo,
    industry: s.industry,
    title: s.title,
    desc: s.desc,
    metrics: s.metrics.map((m) => `${m.label}: ${m.value}`).join("\n"),
    img: s.img,
    year: s.year ? String(s.year) : "",
  };
}

export function formToCaseStudyInput(f: CaseStudyFormData) {
  return {
    client: f.client.trim(),
    logo: f.logo.trim(),
    industry: f.industry.trim(),
    title: f.title.trim(),
    desc: f.desc.trim(),
    metrics: f.metrics
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return { label: line, value: "" };
        return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
      }),
    img: f.img.trim() || undefined,
    year: f.year ? parseInt(f.year, 10) : undefined,
  };
}
