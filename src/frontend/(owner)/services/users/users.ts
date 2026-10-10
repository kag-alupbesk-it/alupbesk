import { request } from "@/services/api/request";
export { getRoleRequests, reviewRoleRequest } from "@/services/api/roleRequests/index";
export type { RoleRequestItem } from "@/services/api/roleRequests/index";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  dept: string;
  role: string;
  status: string;
  active: boolean;
}

export interface UsersData {
  users: UserItem[];
}

export { getRoleRequests as fetchRoleRequests } from "@/services/api/roleRequests/index";
export { reviewRoleRequest as decideRoleRequest } from "@/services/api/roleRequests/index";

export function fetchUsersData(): Promise<UsersData> {
  return request<UsersData>("/owner/users");
}

export function deleteUser(id: string): Promise<null> {
  return request<null>(`/owner/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}
