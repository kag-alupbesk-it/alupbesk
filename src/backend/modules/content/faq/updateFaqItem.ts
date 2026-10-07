import { persistFaqItem } from "./persistFaqItem";
import { faqItems } from "./store";
import type { FaqItem, FaqItemInput } from "../types";

export function updateFaqItem(id: string, input: FaqItemInput): FaqItem | undefined {
  const current = faqItems.get(id);
  if (!current) return undefined;
  const item: FaqItem = {
    id,
    ...input,
    question: input.question.trim(),
    answer: input.answer.trim(),
    createdAt: current.createdAt,
  };
  persistFaqItem(item);
  return item;
}
