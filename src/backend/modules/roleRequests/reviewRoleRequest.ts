import type { AppRole } from "@/backend/auth/roles";
import { db } from "@/services/supabase";
import type { RoleRequestDecision } from "./types";

export async function reviewRoleRequest(
  requestId: string,
  decision: RoleRequestDecision,
  reviewerId: string,
  reviewerRole: AppRole,
): Promise<void> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  if (reviewerRole !== "owner") throw new Error("ROLE_FORBIDDEN");

  const { error } = await db.rpc("review_role_request", {
    request_id_input: requestId,
    decision_input: decision,
    reviewer_id_input: reviewerId,
  });
  if (error) throw error;
}
