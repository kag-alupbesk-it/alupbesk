import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { CustomService } from "../types";

export const customServices = new Map<string, CustomService>();

export function persistCustomService(service: CustomService): void {
  customServices.set(service.id, service);
  enqueueUpsert(
    "custom_services",
    {
      id: service.id,
      icon: service.icon,
      title: service.title,
      description: service.description,
      sort_order: service.sortOrder,
      active: service.active,
      created_at: service.createdAt,
    },
    "id",
  );
}

export function deleteCustomServiceEntry(id: string): boolean {
  const deleted = customServices.delete(id);
  if (deleted) enqueueDelete("custom_services", "id", id);
  return deleted;
}
