import { enqueueDelete } from "@/services/supabase";
import { faqItems } from "./store";

export function deleteFaqEntry(id: string): boolean {
  const deleted = faqItems.delete(id);
  if (deleted) enqueueDelete("faq_items", "id", id);
  return deleted;
}
