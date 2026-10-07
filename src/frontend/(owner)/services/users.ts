import { request } from "@/services/api/request";
export { getRoleRequests, reviewRoleRequest } from "@/services/api/roleRequests";
export type { RoleRequestItem } from "@/services/api/roleRequests";

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

export { getRoleRequests as fetchRoleRequests } from "@/services/api/roleRequests";
export { reviewRoleRequest as decideRoleRequest } from "@/services/api/roleRequests";

export function fetchUsersData(): Promise<UsersData> {
  return request<UsersData>("/owner/users");
}
