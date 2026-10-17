import { randomUUID } from "node:crypto";
import { db } from "@/services/supabase";

export type AuditAction = "CREATE" | "EDIT" | "DELETE" | "UPLOAD";

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  role: string;
  action: AuditAction;
  target: string;
  details: string;
}

type AuditProfile = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

type AuditRow = {
  id: string;
  timestamp: string;
  user_email: string | null;
  user_name: string | null;
  role: string | null;
  action: string;
  target: string | null;
  details: string | null;
};

// Owner & Manager dapat melihat seluruh aktivitas semua role; role lain hanya
// melihat aktivitas role-nya sendiri.
const VIEW_ALL_ROLES = new Set(["owner", "manager"]);
const MAX_IN_MEMORY = 1000;

let auditLogs: AuditLog[] = [];

export function canViewAllAudit(role: string): boolean {
  return VIEW_ALL_ROLES.has(role);
}

export function getAuditLogs(): AuditLog[] {
  return auditLogs;
}

export function getAuditLogsForRole(viewerRole: string): AuditLog[] {
  if (canViewAllAudit(viewerRole)) return auditLogs;
  return auditLogs.filter((log) => log.role === viewerRole);
}

export function replaceAuditLogs(logs: AuditLog[]): void {
  auditLogs = logs.slice(0, MAX_IN_MEMORY);
}

function rowToLog(row: AuditRow): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    userEmail: row.user_email ?? "",
    userName: row.user_name ?? "",
    role: row.role ?? "",
    action: row.action as AuditAction,
    target: row.target ?? "",
    details: row.details ?? "",
  };
}

export function logAuditAction(params: {
  profile?: AuditProfile | null;
  action: AuditAction;
  target: string;
  details: string;
}): AuditLog {
  const log: AuditLog = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    userEmail: params.profile?.email ?? "system@alupbesk.com",
    userName: params.profile?.name ?? "System",
    role: params.profile?.role ?? "system",
    action: params.action,
    target: params.target,
    details: params.details,
  };
  auditLogs.unshift(log);
  if (auditLogs.length > MAX_IN_MEMORY) auditLogs.length = MAX_IN_MEMORY;

  // Persistensi best-effort langsung ke Supabase agar tidak bergantung pada
  // urutan flushWrites() di tiap route dan tidak memblokir antrean tulis lain
  // bila tabel audit_logs belum dimigrasi.
  if (db) {
    void db
      .from("audit_logs")
      .insert({
        id: log.id,
        timestamp: log.timestamp,
        user_email: log.userEmail,
        user_name: log.userName,
        role: log.role,
        action: log.action,
        target: log.target,
        details: log.details,
      })
      .then(({ error }) => {
        if (error) {
          console.error("[audit] gagal menyimpan riwayat aktivitas:", error.message);
        }
      });
  }

  return log;
}

export async function fetchAuditLogsForRole(
  viewerRole: string,
  limit = 500,
): Promise<AuditLog[]> {
  if (db) {
    let query = db
      .from("audit_logs")
      .select("id, timestamp, user_email, user_name, role, action, target, details")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (!canViewAllAudit(viewerRole)) {
      query = query.eq("role", viewerRole);
    }
    const { data, error } = await query;
    if (error) {
      console.error("[audit] gagal memuat riwayat aktivitas:", error.message);
    } else if (data) {
      return (data as AuditRow[]).map(rowToLog);
    }
  }
  return getAuditLogsForRole(viewerRole);
}
