import type { AppRole } from "@/backend/auth/roles";
import { db } from "@/services/supabase";
import type { RoleRequestDecision } from "./types";

export async function reviewRoleRequest(
  requestId: string,
  decision: RoleRequestDecision,
  reviewerRole: AppRole,
  reviewerId: string,
): Promise<void> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  if (reviewerRole !== "owner" && reviewerRole !== "manager") throw new Error("ROLE_FORBIDDEN");
  const { error } = await db.rpc("review_role_request", {
    request_id_input: requestId,
    decision_input: decision,
    reviewer_id_input: reviewerId,
  });
  if (!error) return;
  const message = error.message ?? "";
  for (const code of ["EMAIL_NOT_CONFIRMED", "ROLE_FORBIDDEN", "ROLE_REQUEST_NOT_FOUND", "ROLE_REQUEST_ALREADY_REVIEWED", "INVALID_DECISION"]) {
    if (message.includes(code)) throw new Error(code);
  }
  throw error;
}
