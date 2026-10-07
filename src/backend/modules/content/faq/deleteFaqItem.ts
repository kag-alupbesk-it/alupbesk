import { deleteFaqEntry } from "./deleteFaqEntry";

export function deleteFaqItem(id: string): boolean {
  return deleteFaqEntry(id);
}
