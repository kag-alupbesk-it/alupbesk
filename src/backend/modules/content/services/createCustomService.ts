import { persistCustomService } from "./store";
import type { CustomService, CustomServiceInput } from "../types";

export function createCustomService(input: CustomServiceInput): CustomService {
  const service: CustomService = {
    id: crypto.randomUUID(),
    ...input,
    title: input.title.trim(),
    createdAt: new Date().toISOString(),
  };
  persistCustomService(service);
  return service;
}
