import { enqueueUpsert } from "@/services/supabase";
import type { Partner } from "../types";
import { partners } from "./store";

export function persistPartner(partner: Partner): void {
  partners.set(partner.id, partner);
  enqueueUpsert(
    "partners",
    {
      id: partner.id,
      name: partner.name,
      initials: partner.initials,
      logo_url: partner.logoUrl ?? null,
      sort_order: partner.sortOrder,
      active: partner.active,
      created_at: partner.createdAt,
    },
    "id",
  );
}
