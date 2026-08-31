export interface Partner {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}
export type PartnerInput = Omit<Partner, "id" | "createdAt">;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}
export type FaqItemInput = Omit<FaqItem, "id" | "createdAt">;

export interface CustomService {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}
export type CustomServiceInput = Omit<CustomService, "id" | "createdAt">;

export type SiteContentKey =
  | "hero"
  | "profile"
  | "contact"
  | "custom_steps"
  | "custom_capacities";

export interface SiteContent {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
}
export type SiteContentInput = Omit<SiteContent, "updatedAt">;
