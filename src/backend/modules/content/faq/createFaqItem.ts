import { persistFaqItem } from "./persistFaqItem";
import type { FaqItem, FaqItemInput } from "../types";

export function createFaqItem(input: FaqItemInput): FaqItem {
  const item: FaqItem = {
    id: crypto.randomUUID(),
    ...input,
    question: input.question.trim(),
    answer: input.answer.trim(),
    createdAt: new Date().toISOString(),
  };
  persistFaqItem(item);
  return item;
}
