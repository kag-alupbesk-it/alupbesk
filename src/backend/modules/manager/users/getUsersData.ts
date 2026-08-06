import { getCustomRequests } from "@/backend/modules/custom";
import type { UserItem, UsersData } from "../types";

export function getUsersData(): UsersData {
  const users: UserItem[] = getCustomRequests().map((request) => ({
    name: request.nama,
    email: request.email || `${request.nama.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@alupbesk.id`,
    dept: request.layanan,
    role: "Staff",
    status: "ACTIVE",
    active: true,
  }));
  return { users };
}
