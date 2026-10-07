import { deletePartnerEntry } from "./deletePartnerEntry";

export function deletePartner(id: string): boolean {
  return deletePartnerEntry(id);
}
