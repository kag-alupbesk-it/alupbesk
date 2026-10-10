import type { AppRole } from "@/backend/auth/roles";
import { db } from "@/services/supabase";
import type { RoleRequestDecision } from "./types";

export interface RoleRequestReview {
  role?: AppRole;
  dept?: string;
}

export async function reviewRoleRequest(
  requestId: string,
  decision: RoleRequestDecision,
  reviewerRole: AppRole,
  review?: RoleRequestReview,
): Promise<void> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");
  if (reviewerRole !== "owner") throw new Error("ROLE_FORBIDDEN");

  const { data: profile, error: lookupError } = await db
    .from("users")
    .select("id, status, role, dept")
    .eq("id", requestId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!profile) throw new Error("ROLE_REQUEST_NOT_FOUND");
  if (profile.status !== "PENDING") throw new Error("ROLE_REQUEST_ALREADY_REVIEWED");

  const patch =
    decision === "approve"
      ? {
          status: "ACTIVE",
          active: true,
          role: review?.role ?? profile.role,
          dept: review?.dept?.trim() || profile.dept,
        }
      : { status: "SUSPENDED", active: false };

  const { error } = await db.from("users").update(patch).eq("id", requestId);
  if (error) throw error;
}
