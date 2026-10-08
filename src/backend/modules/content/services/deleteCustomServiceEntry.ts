import { enqueueDelete } from "@/services/supabase";
import { customServices } from "./store";

export function deleteCustomServiceEntry(id: string): boolean {
  const deleted = customServices.delete(id);
  if (deleted) enqueueDelete("custom_services", "id", id);
  return deleted;
}
