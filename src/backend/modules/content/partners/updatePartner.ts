import { persistPartner } from "./persistPartner";
import { partners } from "./store";
import type { Partner, PartnerInput } from "../types";

export function updatePartner(id: string, input: Partial<PartnerInput>): Partner | undefined {
  const current = partners.get(id);
  if (!current) return undefined;
  const partner: Partner = {
    ...current,
    ...input,
    id,
    name: input.name !== undefined ? input.name.trim() : current.name,
    initials: input.initials !== undefined ? input.initials.trim() : current.initials,
    createdAt: current.createdAt,
  };
  persistPartner(partner);
  return partner;
}
