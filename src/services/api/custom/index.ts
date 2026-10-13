import type { CreateCustomRequestInput, CustomRequest, CustomRequestStatus } from "@/backend/modules/custom";
import { request } from "../request";
export const customApi = {
  createRequest: (input: CreateCustomRequestInput): Promise<CustomRequest> => request("/custom/requests", { method: "POST", body: JSON.stringify(input) }),
  getRequests: (): Promise<CustomRequest[]> => request("/custom/requests"),
  updateStatus: (id: string, status: CustomRequestStatus): Promise<CustomRequest> => request(`/custom/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};