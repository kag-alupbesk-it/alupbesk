import { writeOrder } from "./orderStore";
import type { LocalOrder } from "./types";
export function saveLocalOrder(order: LocalOrder): void { writeOrder(order); }
