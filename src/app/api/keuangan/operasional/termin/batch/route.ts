import { z } from "zod";
import { persistKeuanganRecord, terminDataSchema } from "@/backend/modules/keuangan";
import type { TerminRecord } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";

const batchSchema = z.object({ records: z.array(terminDataSchema).min(1) });

export async function POST(request: Request) {
  const parsed = batchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_TERMIN_SCHEDULE", message: parsed.error.issues[0]?.message ?? "Skema termin tidak valid." } },
      { status: 400 },
    );
  }

  const createdAt = new Date().toISOString();
  const records = parsed.data.records.map((data): { kind: "termin"; data: TerminRecord } => ({
    kind: "termin",
    data: { ...data, id: `termin-${crypto.randomUUID()}`, createdAt, status: "unpaid" },
  }));
  for (const record of records) persistKeuanganRecord(record);
  await flushWrites();
  return Response.json({ success: true, data: records }, { status: 201 });
}
