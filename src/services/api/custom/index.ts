import type { CreateCustomRequestInput, CustomRequest } from "@/backend/modules/custom";
import { request } from "../request";
export const customApi = {
  createRequest: (input: CreateCustomRequestInput): Promise<CustomRequest> => request("/custom/requests", { method: "POST", body: JSON.stringify(input) }),
  getRequests: (): Promise<CustomRequest[]> => request("/custom/requests"),
};
