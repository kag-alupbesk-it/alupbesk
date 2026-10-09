import { request } from "@/services/api/request";

export interface RoleRequestReview {
  role?: string;
  dept?: string;
}

export function reviewRoleRequest(
  id: string,
  decision: "approve" | "reject",
  review?: RoleRequestReview,
): Promise<{ id: string }> {
  return request<{ id: string }>(`/owner/role-requests/${encodeURIComponent(id)}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, ...review }),
  });
}
