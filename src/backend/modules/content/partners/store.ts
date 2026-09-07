import { enqueueUpsert, enqueueDelete } from "@/services/supabase";
import type { Partner } from "../types";

export const partners = new Map<string, Partner>();

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

export function deletePartnerEntry(id: string): boolean {
  const deleted = partners.delete(id);
  if (deleted) enqueueDelete("partners", "id", id);
  return deleted;
}
