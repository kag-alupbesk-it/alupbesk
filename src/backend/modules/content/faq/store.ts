import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { FaqItem } from "../types";

export const faqItems = new Map<string, FaqItem>();

export function persistFaqItem(item: FaqItem): void {
  faqItems.set(item.id, item);
  enqueueUpsert(
    "faq_items",
    {
      id: item.id,
      question: item.question,
      answer: item.answer,
      sort_order: item.sortOrder,
      active: item.active,
      created_at: item.createdAt,
    },
    "id",
  );
}

export function deleteFaqEntry(id: string): boolean {
  const deleted = faqItems.delete(id);
  if (deleted) enqueueDelete("faq_items", "id", id);
  return deleted;
}
