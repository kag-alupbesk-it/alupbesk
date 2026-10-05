import {
  deleteKeuanganRecord,
  keuanganRecords,
  persistKeuanganRecord,
  updateKeuanganRecordSchema,
} from "@/backend/modules/keuangan";
import type { KeuanganRecord } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";

function unavailable(message: string, status: number) {
  return Response.json({ success: false, error: { code: "FINANCE_RECORD_UNAVAILABLE", message } }, { status });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updateKeuanganRecordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_FINANCE_RECORD", message: parsed.error.issues[0]?.message ?? "Data keuangan tidak valid." } },
      { status: 400 },
    );
  }
  const existing = keuanganRecords.get(id);
  if (!existing) return unavailable("Data keuangan tidak ditemukan.", 404);
  if (parsed.data.kind !== existing.kind) return unavailable("Jenis data tidak dapat diubah.", 400);
  if (!isEditable(existing)) return unavailable("Data dengan status ini tidak dapat diubah.", 409);

  let updated: KeuanganRecord;
  switch (existing.kind) {
    case "approval":
      if (parsed.data.kind !== "approval") return unavailable("Jenis data tidak dapat diubah.", 400);
      updated = { kind: "approval", data: { ...parsed.data.data, id, createdAt: existing.data.createdAt, status: existing.data.status } };
      break;
    case "petty_cash":
      if (parsed.data.kind !== "petty_cash") return unavailable("Jenis data tidak dapat diubah.", 400);
      updated = { kind: "petty_cash", data: { ...parsed.data.data, id, createdAt: existing.data.createdAt, status: existing.data.status } };
      break;
    case "termin":
      if (parsed.data.kind !== "termin") return unavailable("Jenis data tidak dapat diubah.", 400);
      updated = { kind: "termin", data: { ...parsed.data.data, id, createdAt: existing.data.createdAt, status: existing.data.status } };
      break;
    case "payroll":
      if (parsed.data.kind !== "payroll") return unavailable("Jenis data tidak dapat diubah.", 400);
      updated = { kind: "payroll", data: { ...parsed.data.data, id, createdAt: existing.data.createdAt, status: existing.data.status } };
      break;
  }
  persistKeuanganRecord(updated);
  await flushWrites();
  return Response.json({ success: true, data: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = keuanganRecords.get(id);
  if (!existing) return unavailable("Data keuangan tidak ditemukan.", 404);
  if (!isEditable(existing)) return unavailable("Data yang sudah diproses tidak dapat dihapus.", 409);

  const deleted = deleteKeuanganRecord(id);
  await flushWrites();
  return Response.json({ success: true, data: deleted });
}

function isEditable(record: KeuanganRecord): boolean {
  return record.data.status === "pending" || record.data.status === "unpaid";
}
