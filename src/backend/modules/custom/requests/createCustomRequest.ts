import { persistCustomRequest } from "./store";
import type {
  CreateCustomRequestInput,
  CustomRequest,
  CustomRequestItem,
} from "./types";

export function createCustomRequest(input: CreateCustomRequestInput): CustomRequest {
  const now = new Date().toISOString();

  const items: CustomRequestItem[] = input.items.map((item, index) => ({
    id: crypto.randomUUID(),
    name: item.name.trim(),
    quantity: item.quantity,
    unit: item.unit?.trim() || "pcs",
    technicalNote: item.technicalNote?.trim() ?? "",
    sortOrder: index,
  }));

  const request: CustomRequest = {
    id: crypto.randomUUID(),
    ...input,
    items,
    source: "WEBSITE_JASA_CUSTOM",
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };

  persistCustomRequest(request);

  return request;
}