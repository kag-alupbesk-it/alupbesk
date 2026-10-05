import { createKeuanganRecordSchema, getKeuanganRecords, persistKeuanganRecord } from "@/backend/modules/keuangan";
import type { KeuanganRecord } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";

const recordKinds = ["approval", "petty_cash", "termin", "payroll"] as const;

export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind");
  if (kind && !recordKinds.includes(kind as (typeof recordKinds)[number])) {
    return Response.json(
      { success: false, error: { code: "INVALID_RECORD_KIND", message: "Jenis data keuangan tidak valid." } },
      { status: 400 },
    );
  }
  return Response.json({ success: true, data: getKeuanganRecords(kind as (typeof recordKinds)[number] | undefined) });
}

export async function POST(request: Request) {
  const parsed = createKeuanganRecordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_FINANCE_RECORD", message: parsed.error.issues[0]?.message ?? "Data keuangan tidak valid." } },
      { status: 400 },
    );
  }

  const id = `${parsed.data.kind}-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  let record: KeuanganRecord;
  switch (parsed.data.kind) {
    case "approval":
      record = { kind: "approval", data: { ...parsed.data.data, id, createdAt, status: "pending" } };
      break;
    case "petty_cash":
      record = { kind: "petty_cash", data: { ...parsed.data.data, id, createdAt, status: "pending" } };
      break;
    case "termin":
      record = {
        kind: "termin",
        data: { ...parsed.data.data, id, createdAt, status: "unpaid" },
      };
      break;
    case "payroll":
      record = { kind: "payroll", data: { ...parsed.data.data, id, createdAt, status: "unpaid" } };
      break;
  }

  persistKeuanganRecord(record);
  await flushWrites();
  return Response.json({ success: true, data: record }, { status: 201 });
}
