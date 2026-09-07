import { deleteFaqEntry } from "./store";

export function deleteFaqItem(id: string): boolean {
  return deleteFaqEntry(id);
}
