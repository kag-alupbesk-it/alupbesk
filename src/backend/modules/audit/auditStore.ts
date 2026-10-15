export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  role: string;
  action: "UPLOAD" | "EDIT" | "DELETE" | "CREATE";
  target: string;
  details: string;
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    userEmail: "owner@alupbesk.com",
    userName: "Owner",
    role: "owner",
    action: "CREATE",
    target: "Sistem",
    details: "Inisialisasi sistem pencatatan riwayat aktivitas (audit log)",
  },
];

export function logAuditAction(params: {
  profile?: { email?: string; name?: string; role?: string } | null;
  action: "UPLOAD" | "EDIT" | "DELETE" | "CREATE";
  target: string;
  details: string;
}) {
  const log: AuditLog = {
    id: String(Date.now() + Math.random()),
    timestamp: new Date().toISOString(),
    userEmail: params.profile?.email ?? "system@alupbesk.com",
    userName: params.profile?.name ?? "System",
    role: params.profile?.role ?? "system",
    action: params.action,
    target: params.target,
    details: params.details,
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 500) auditLogs.pop();
}

export function getAuditLogs(): AuditLog[] {
  return auditLogs;
}
