export function roleColor(role: string) {
  return role === "owner"
    ? "bg-secondary/10 text-secondary"
    : "bg-surface-variant text-on-surface-variant";
}

export function statusInfo(status: string) {
  switch (status) {
    case "ACTIVE": return { statusColor: "text-emerald-700 dark:text-emerald-300" as const, active: true as const };
    case "SUSPENDED": return { statusColor: "text-red-700 dark:text-red-300" as const, active: false as const };
    case "PENDING": return { statusColor: "text-amber-800 dark:text-amber-300" as const, active: false as const };
    default: return { statusColor: "text-on-surface-variant" as const, active: false as const };
  }
}
