import { request } from "@/services/api/request";

export interface UserItem {
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

export function fetchUsersData(): Promise<UsersData> {
  return request<UsersData>("/owner/users");
}
