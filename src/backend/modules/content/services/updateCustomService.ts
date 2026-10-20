import { persistCustomService } from "./persistCustomService";
import { customServices } from "./store";
import type { CustomService, CustomServiceInput } from "../types";

export function updateCustomService(id: string, input: Partial<CustomServiceInput>): CustomService | undefined {
  const current = customServices.get(id);
  if (!current) return undefined;
  const service: CustomService = {
    ...current,
    ...input,
    id,
    title: input.title !== undefined ? input.title.trim() : current.title,
    description: input.description !== undefined ? input.description.trim() : current.description,
    createdAt: current.createdAt,
  };
  persistCustomService(service);
  return service;
}
