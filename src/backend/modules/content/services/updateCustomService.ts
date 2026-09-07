import { persistCustomService, customServices } from "./store";
import type { CustomService, CustomServiceInput } from "../types";

export function updateCustomService(id: string, input: CustomServiceInput): CustomService | undefined {
  const current = customServices.get(id);
  if (!current) return undefined;
  const service: CustomService = {
    id,
    ...input,
    title: input.title.trim(),
    createdAt: current.createdAt,
  };
  persistCustomService(service);
  return service;
}
