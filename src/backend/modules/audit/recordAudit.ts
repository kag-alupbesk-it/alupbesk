import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { logAuditAction, type AuditAction } from "./auditStore";

export type AuditActor =
  | { email?: string | null; name?: string | null; role?: string | null }
  | null
  | undefined;

/**
 * Catat aktivitas memakai profil yang sudah diambil lewat authorizeCurrentUser.
 * Dipakai pada route handler yang sudah memiliki `access.profile`.
 */
export function recordAudit(
  actor: AuditActor,
  action: AuditAction,
  target: string,
  details: string,
): void {
  logAuditAction({ profile: actor ?? undefined, action, target, details });
}

/**
 * Catat aktivitas dengan mengambil profil pengguna saat ini secara mandiri.
 * Dipakai pada route handler lama yang proteksinya hanya lewat proxy (tidak
 * memanggil authorizeCurrentUser), mis. content/gudang/keuangan/marketing.
 */
export async function recordAuditForCurrentUser(
  action: AuditAction,
  target: string,
  details: string,
): Promise<void> {
  try {
    const profile = await getAuthenticatedProfile();
    logAuditAction({ profile, action, target, details });
  } catch {
    logAuditAction({ action, target, details });
  }
}
