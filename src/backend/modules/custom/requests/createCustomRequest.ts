import { customRequests } from "./store";
import type { CreateCustomRequestInput, CustomRequest } from "./types";

export function createCustomRequest(input: CreateCustomRequestInput): CustomRequest {
  const now = new Date().toISOString();

  const request: CustomRequest = {
    id: crypto.randomUUID(),
    ...input,
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };

  customRequests.set(request.id, request);

  return request;
}
