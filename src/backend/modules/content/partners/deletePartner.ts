import { deletePartnerEntry } from "./store";

export function deletePartner(id: string): boolean {
  return deletePartnerEntry(id);
}
