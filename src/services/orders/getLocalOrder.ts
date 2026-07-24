import { readOrder } from "./orderStore";
import type { LocalOrder } from "./types";
export function getLocalOrder(id: string): LocalOrder | undefined { return readOrder(id); }
