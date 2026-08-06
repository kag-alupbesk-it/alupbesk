import { publishOrderStatus } from "@/services/orders";
import type { MarketingOrder } from "./types";
export function submitOrderToManager(id: string): MarketingOrder | undefined { const updated = publishOrderStatus(id, "submitted_to_manager"); if (!updated) return undefined; const now = new Date().toISOString(); return { ...updated, status: "submitted_to_manager", marketingConfirmedAt: now, submittedToManagerAt: now }; }
