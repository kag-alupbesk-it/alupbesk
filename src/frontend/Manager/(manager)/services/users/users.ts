import { request } from "@/services/api/request";

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

export function fetchUsersData(): Promise<UsersData> {
  return request<UsersData>("/manager/users");
}

export type UserInput = Pick<UserItem, "name" | "email" | "dept" | "role">;
export type UserUpdate = UserInput & Pick<UserItem, "status">;

export function createUser(input: UserInput): Promise<UserItem> {
  return request<UserItem>("/manager/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateUser(id: string, input: UserUpdate): Promise<UserItem> {
  return request<UserItem>(`/manager/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteUser(id: string): Promise<null> {
  return request<null>(`/manager/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
