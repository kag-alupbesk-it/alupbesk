import { request } from "@/services/api/request";
import type { PMOrder } from "@/services/pm/types";

export function handoffPMOrder(id: string): Promise<PMOrder> {
  return request(`/pm/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "handoff" }),
  });
}
