import { customServices } from "./store";
import type { CustomService } from "../types";

export function getCustomServices(): CustomService[] {
  return [...customServices.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}
