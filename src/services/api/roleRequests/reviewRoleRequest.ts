import { request } from "@/services/api/request";

export function reviewRoleRequest(
  id: string,
  decision: "approve" | "reject",
): Promise<{ id: string }> {
  return request<{ id: string }>(`/owner/role-requests/${encodeURIComponent(id)}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });
}
