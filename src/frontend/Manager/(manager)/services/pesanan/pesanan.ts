import { request } from "@/services/api/request";
import type { ProjectOrder, CreateProjectOrderInput } from "@/backend/modules/gudang";
import type { GudangItem } from "@/backend/modules/gudang";

export function getProyekItems(): Promise<GudangItem[]> {
  return request<GudangItem[]>("/manager/project-orders/items");
}

export function createProjectOrder(input: CreateProjectOrderInput): Promise<ProjectOrder> {
  return request<ProjectOrder>("/manager/project-orders", { method: "POST", body: JSON.stringify(input) });
}
