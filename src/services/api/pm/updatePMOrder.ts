import { request } from "@/services/api/request";
import type { PMOrder, PMOrderMutation } from "@/services/pm/types";

export function updatePMOrder(
  id: string,
  mutation: PMOrderMutation,
): Promise<PMOrder> {
  return request(`/pm/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(mutation),
  });
}
