import { request } from "@/services/api/request";
import type {
  ApprovalRecord,
  KeuanganRecord,
  KeuanganRecordKind,
  PayrollRecord,
  PettyCashRecord,
  TerminRecord,
} from "@/backend/modules/keuangan";

export type KeuanganRecordData = {
  approval: Omit<ApprovalRecord, "id" | "status">;
  petty_cash: Omit<PettyCashRecord, "id" | "status">;
  termin: Omit<TerminRecord, "id" | "status">;
  payroll: Omit<PayrollRecord, "id" | "status">;
};

export function fetchKeuanganRecords(kind: KeuanganRecordKind): Promise<KeuanganRecord[]> {
  return request<KeuanganRecord[]>(`/keuangan/operasional?kind=${kind}`);
}

export function createKeuanganRecord<K extends KeuanganRecordKind>(
  kind: K,
  data: KeuanganRecordData[K],
): Promise<Extract<KeuanganRecord, { kind: K }>> {
  return request<Extract<KeuanganRecord, { kind: K }>>("/keuangan/operasional", {
    method: "POST",
    body: JSON.stringify({ kind, data }),
  });
}

export function createKeuanganTerminSchedule(
  records: KeuanganRecordData["termin"][],
): Promise<Extract<KeuanganRecord, { kind: "termin" }>[]> {
  return request<Extract<KeuanganRecord, { kind: "termin" }>[]>(
    "/keuangan/operasional/termin/batch",
    { method: "POST", body: JSON.stringify({ records }) },
  );
}

export function updateKeuanganRecord<K extends KeuanganRecordKind>(
  kind: K,
  id: string,
  data: KeuanganRecordData[K],
): Promise<Extract<KeuanganRecord, { kind: K }>> {
  return request<Extract<KeuanganRecord, { kind: K }>>(`/keuangan/operasional/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ kind, data }),
  });
}

export function deleteKeuanganRecord(id: string): Promise<KeuanganRecord> {
  return request<KeuanganRecord>(`/keuangan/operasional/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function updateKeuanganStatus(
  id: string,
  status: "approved" | "rejected" | "paid",
  reason?: string,
): Promise<KeuanganRecord> {
  return request<KeuanganRecord>(`/keuangan/operasional/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}
