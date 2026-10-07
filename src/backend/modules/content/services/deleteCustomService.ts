import { deleteCustomServiceEntry } from "./deleteCustomServiceEntry";

export function deleteCustomService(id: string): boolean {
  return deleteCustomServiceEntry(id);
}
