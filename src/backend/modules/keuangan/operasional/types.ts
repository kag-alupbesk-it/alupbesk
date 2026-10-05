export type KeuanganRecordKind = "approval" | "petty_cash" | "termin" | "payroll";

export type ApprovalRecord = {
  id: string;
  createdAt?: string;
  title: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
};

export type PettyCashRecord = {
  id: string;
  createdAt?: string;
  title: string;
  amount: number;
  date: string;
  note: string;
  status: "pending" | "approved";
};

export type TerminRecord = {
  id: string;
  createdAt?: string;
  name: string;
  amount: number;
  progress: number;
  status: "paid" | "unpaid";
  projectName: string;
  clientName: string;
  dueDate: string;
  percentage: number;
  contractValue: number;
};

export type PayrollRecord = {
  id: string;
  createdAt?: string;
  name: string;
  role: string;
  workers: number;
  days: number;
  rate: number;
  type: "harian" | "borongan";
  status: "paid" | "unpaid";
};

export type KeuanganRecord =
  | { kind: "approval"; data: ApprovalRecord }
  | { kind: "petty_cash"; data: PettyCashRecord }
  | { kind: "termin"; data: TerminRecord }
  | { kind: "payroll"; data: PayrollRecord };

export function isKeuanganRecord(value: unknown): value is KeuanganRecord {
  if (value === null || typeof value !== "object" || !("kind" in value) || !("data" in value)) return false;
  const record = value as { kind: unknown; data: unknown };
  if (record.data === null || typeof record.data !== "object" || Array.isArray(record.data)) return false;
  const data = record.data as Record<string, unknown>;
  if (typeof data.id !== "string" || typeof data.status !== "string") return false;
  if (data.createdAt !== undefined && typeof data.createdAt !== "string") return false;

  switch (record.kind) {
    case "approval":
      return typeof data.title === "string" &&
        typeof data.vendor === "string" &&
        typeof data.amount === "number" &&
        typeof data.date === "string" &&
        typeof data.category === "string" &&
        ["pending", "approved", "rejected"].includes(data.status);
    case "petty_cash":
      return typeof data.title === "string" &&
        typeof data.amount === "number" &&
        typeof data.date === "string" &&
        typeof data.note === "string" &&
        ["pending", "approved"].includes(data.status);
    case "termin":
      return typeof data.name === "string" &&
        typeof data.amount === "number" &&
        typeof data.progress === "number" &&
        typeof data.projectName === "string" &&
        typeof data.clientName === "string" &&
        typeof data.dueDate === "string" &&
        typeof data.percentage === "number" &&
        typeof data.contractValue === "number" &&
        ["paid", "unpaid"].includes(data.status);
    case "payroll":
      return typeof data.name === "string" &&
        typeof data.role === "string" &&
        typeof data.workers === "number" &&
        typeof data.days === "number" &&
        typeof data.rate === "number" &&
        (data.type === "harian" || data.type === "borongan") &&
        ["paid", "unpaid"].includes(data.status);
    default:
      return false;
  }
}
