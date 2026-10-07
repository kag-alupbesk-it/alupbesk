import type { AppRole } from "@/backend/auth/roles";

export interface RoleRequest {
  id: string;
  profileId: string;
  name: string;
  email: string;
  department: string;
  requestedRole: AppRole;
  createdAt: string;
}

export type RoleRequestDecision = "approve" | "reject";
