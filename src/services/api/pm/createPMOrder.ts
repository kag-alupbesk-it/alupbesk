import { request } from "@/services/api/request";
import type { NewPMOrderInput, PMOrder } from "@/services/pm/types";

export function createPMOrder(input: NewPMOrderInput): Promise<PMOrder> {
  return request("/pm/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
