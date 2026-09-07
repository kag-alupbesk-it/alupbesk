import { persistPartner } from "./store";
import type { Partner, PartnerInput } from "../types";

export function createPartner(input: PartnerInput): Partner {
  const partner: Partner = {
    id: crypto.randomUUID(),
    ...input,
    name: input.name.trim(),
    initials: input.initials.trim(),
    createdAt: new Date().toISOString(),
  };
  persistPartner(partner);
  return partner;
}
