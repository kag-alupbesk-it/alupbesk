import { gudangItems } from "./store";
import type { GudangItem } from "./types";
export function getGudangItems(): GudangItem[] { return [...gudangItems.values()]; }
