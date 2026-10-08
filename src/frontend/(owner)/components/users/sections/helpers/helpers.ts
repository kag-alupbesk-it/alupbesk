export function roleColor(role: string) {
  return role === "owner" ? "bg-secondary/10 text-secondary" : "bg-white/10 text-white/50";
}

export function statusInfo(status: string) {
  switch (status) {
    case "ACTIVE": return { statusColor: "text-secondary" as const, active: true as const };
    case "SUSPENDED": return { statusColor: "text-red-400" as const, active: false as const };
    default: return { statusColor: "text-white/40" as const, active: false as const };
  }
}
