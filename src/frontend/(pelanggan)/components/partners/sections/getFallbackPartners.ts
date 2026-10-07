import type { Partner } from "@/backend/modules/content";
import { partners as fallbackData } from "./data";

export function getFallbackPartners(): Partner[] {
  return fallbackData.map((partner, index) => ({
    id: `catalog-partner-${index + 1}`,
    name: partner.name,
    initials: partner.initials,
    logoUrl: partner.logoUrl,
    sortOrder: index,
    active: true,
    createdAt: "",
  }));
}
