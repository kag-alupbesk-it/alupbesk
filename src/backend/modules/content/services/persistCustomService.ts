import { enqueueUpsert } from "@/services/supabase";
import type { CustomService } from "../types";
import { customServices } from "./store";

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
