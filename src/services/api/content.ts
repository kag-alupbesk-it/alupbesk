import type { CustomService, CustomServiceInput, FaqItem, FaqItemInput, Partner, PartnerInput, SiteContent } from "@/backend/modules/content";
import type { CaseStudy, CaseStudyInput, PortfolioItem, PortfolioItemInput } from "@/services/portfolio";
import { request } from "./request";

export const contentApi = {
  getPartners: (): Promise<Partner[]> => request("/content/partners"),
  createPartner: (input: PartnerInput): Promise<Partner> => request("/content/partners", { method: "POST", body: JSON.stringify(input) }),
  updatePartner: (id: string, input: PartnerInput): Promise<Partner> => request(`/content/partners/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deletePartner: (id: string): Promise<void> => request(`/content/partners/${id}`, { method: "DELETE" }),

  getFaq: (): Promise<FaqItem[]> => request("/content/faq"),
  createFaq: (input: FaqItemInput): Promise<FaqItem> => request("/content/faq", { method: "POST", body: JSON.stringify(input) }),
  updateFaq: (id: string, input: FaqItemInput): Promise<FaqItem> => request(`/content/faq/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteFaq: (id: string): Promise<void> => request(`/content/faq/${id}`, { method: "DELETE" }),

  getServices: (): Promise<CustomService[]> => request("/content/services"),
  createService: (input: CustomServiceInput): Promise<CustomService> => request("/content/services", { method: "POST", body: JSON.stringify(input) }),
  updateService: (id: string, input: CustomServiceInput): Promise<CustomService> => request(`/content/services/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteService: (id: string): Promise<void> => request(`/content/services/${id}`, { method: "DELETE" }),

  getSiteContent: (key: string): Promise<SiteContent> => request(`/content/site/${key}`),
  saveSiteContent: (key: string, value: Record<string, unknown>): Promise<SiteContent> => request(`/content/site/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),

  getPortfolio: (): Promise<{ items: PortfolioItem[]; caseStudies: CaseStudy[] }> => request("/content/portfolio"),
  createPortfolioItem: (input: PortfolioItemInput): Promise<PortfolioItem> => request("/content/portfolio/items", { method: "POST", body: JSON.stringify(input) }),
  updatePortfolioItem: (id: number, input: PortfolioItemInput): Promise<PortfolioItem> => request(`/content/portfolio/items/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deletePortfolioItem: (id: number): Promise<void> => request(`/content/portfolio/items/${id}`, { method: "DELETE" }),
  createCaseStudy: (input: CaseStudyInput): Promise<CaseStudy> => request("/content/portfolio/studies", { method: "POST", body: JSON.stringify(input) }),
  updateCaseStudy: (id: number, input: CaseStudyInput): Promise<CaseStudy> => request(`/content/portfolio/studies/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteCaseStudy: (id: number): Promise<void> => request(`/content/portfolio/studies/${id}`, { method: "DELETE" }),
};
