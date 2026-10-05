import { enqueueDelete, enqueueUpsert } from "@/services/supabase";
import type { KeuanganRecord, KeuanganRecordKind } from "./types";

export const keuanganRecords = new Map<string, KeuanganRecord>();

export function persistKeuanganRecord(record: KeuanganRecord): void {
  keuanganRecords.set(record.data.id, record);
  enqueueUpsert(
    "keuangan_records",
    {
      id: record.data.id,
      jenis: record.kind,
      data: record.data,
      updated_at: new Date().toISOString(),
    },
    "id",
  );
}

export function deleteKeuanganRecord(id: string): KeuanganRecord | undefined {
  const record = keuanganRecords.get(id);
  if (!record) return undefined;
  keuanganRecords.delete(id);
  enqueueDelete("keuangan_records", "id", id);
  return record;
}

export function getKeuanganRecords(kind?: KeuanganRecordKind): KeuanganRecord[] {
  return [...keuanganRecords.values()]
    .filter((record) => !kind || record.kind === kind)
    .sort((left, right) => getRecordDate(right).localeCompare(getRecordDate(left)));
}

function getRecordDate(record: KeuanganRecord): string {
  if (record.data.createdAt) return record.data.createdAt;
  switch (record.kind) {
    case "termin":
      return record.data.dueDate;
    case "payroll":
      return record.data.id;
    case "approval":
    case "petty_cash":
      return record.data.date;
  }
}
