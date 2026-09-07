import { partners } from "./store";
import type { Partner } from "../types";

export function getPartners(): Partner[] {
  return [...partners.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}
