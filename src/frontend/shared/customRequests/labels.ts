import type { CustomRequestStatus } from "@/backend/modules/custom";

export const CUSTOM_REQUEST_STATUS_LABELS: Record<string, string> = {
  submitted: "Pending",
  reviewed: "In Review",
  quoted: "Quotation Sent",
  accepted: "Approved",
  rejected: "Rejected",
};

export const CUSTOM_REQUEST_STATUS_OPTIONS: ReadonlyArray<"ALL" | CustomRequestStatus> = [
  "ALL",
  "submitted",
  "reviewed",
  "quoted",
  "accepted",
  "rejected",
];

export type CustomStatusTone = "neutral" | "blue" | "violet" | "green" | "red";

export const CUSTOM_REQUEST_STATUS_TONES: Record<CustomRequestStatus, CustomStatusTone> = {
  submitted: "neutral",
  reviewed: "blue",
  quoted: "violet",
  accepted: "green",
  rejected: "red",
};

export function customStatusTone(status: string): CustomStatusTone {
  if (status === "submitted") return "neutral";
  if (status === "reviewed") return "blue";
  if (status === "quoted") return "violet";
  if (status === "accepted") return "green";
  if (status === "rejected") return "red";
  return "neutral";
}

export interface CustomStatusBadgeProps {
  status: string;
  className?: string;
}

const toneClasses: Record<CustomStatusTone, string> = {
  neutral: "bg-slate-400/12 text-slate-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  green: "bg-emerald-400/12 text-emerald-300",
  red: "bg-red-400/12 text-red-300",
};

export function customStatusBadgeClass(status: string): string {
  return toneClasses[customStatusTone(status)];
}