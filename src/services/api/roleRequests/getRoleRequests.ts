import { request } from "@/services/api/request";
import type { RoleRequestItem } from "./types";

export function getRoleRequests(): Promise<RoleRequestItem[]> {
  return request<RoleRequestItem[]>("/owner/role-requests");
}
