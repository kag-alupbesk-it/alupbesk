import { enqueueUpsert } from "@/services/supabase";
import type { FaqItem } from "../types";
import { faqItems } from "./store";

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
