import { enqueueDelete } from "@/services/supabase";
import { partners } from "./store";

export function deletePartnerEntry(id: string): boolean {
  const deleted = partners.delete(id);
  if (deleted) enqueueDelete("partners", "id", id);
  return deleted;
}
