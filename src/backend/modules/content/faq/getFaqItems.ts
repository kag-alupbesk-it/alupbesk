import { faqItems } from "./store";
import type { FaqItem } from "../types";

export function getFaqItems(): FaqItem[] {
  return [...faqItems.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}
