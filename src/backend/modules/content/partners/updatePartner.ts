import { persistPartner, partners } from "./store";
import type { Partner, PartnerInput } from "../types";

export function updatePartner(id: string, input: PartnerInput): Partner | undefined {
  const current = partners.get(id);
  if (!current) return undefined;
  const partner: Partner = {
    id,
    ...input,
    name: input.name.trim(),
    initials: input.initials.trim(),
    createdAt: current.createdAt,
  };
  persistPartner(partner);
  return partner;
}
