import { deleteCustomServiceEntry } from "./store";

export function deleteCustomService(id: string): boolean {
  return deleteCustomServiceEntry(id);
}
