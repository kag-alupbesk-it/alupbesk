import { request } from "@/services/api/request";

export interface NotificationTask {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

export function fetchNotificationTasks(): Promise<NotificationTask[]> {
  return request<NotificationTask[]>("/notifications");
}
