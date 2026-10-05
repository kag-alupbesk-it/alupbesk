import { z } from "zod";
import { createKasEntry, keuanganRecords, persistKeuanganRecord } from "@/backend/modules/keuangan";
import type { KeuanganRecord } from "@/backend/modules/keuangan";
import { flushWrites } from "@/services/supabase";

const statusSchema = z.object({
  status: z.enum(["approved", "rejected", "paid"]),
  reason: z.string().trim().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_FINANCE_STATUS", message: "Status keuangan tidak valid." } },
      { status: 400 },
    );
  }

  const existing = keuanganRecords.get(id);
  if (!existing) {
    return Response.json(
      { success: false, error: { code: "FINANCE_RECORD_NOT_FOUND", message: "Data keuangan tidak ditemukan." } },
      { status: 404 },
    );
  }

  const { status, reason } = parsed.data;
  if (!isAllowedTransition(existing, status) || (status === "rejected" && !reason)) {
    return Response.json(
      { success: false, error: { code: "INVALID_FINANCE_TRANSITION", message: "Perubahan status tidak diizinkan." } },
      { status: 409 },
    );
  }

  if (existing.kind === "approval" && status === "approved") {
    const result = createKasEntry({
      tipe: "keluar",
      deskripsi: `${existing.data.title} · ${existing.data.vendor}`,
      jumlah: existing.data.amount,
      kategori: "operasional",
      tanggal: existing.data.date,
    });
    if (!result.ok) {
      return Response.json(
        { success: false, error: { code: result.code, message: "Pengeluaran tidak dapat dicatat ke buku kas." } },
        { status: 400 },
      );
    }
  }

  if (existing.kind === "payroll" && status === "paid") {
    const result = createKasEntry({
      tipe: "keluar",
      deskripsi: `Pencairan gaji ${existing.data.name}`,
      jumlah: existing.data.workers * existing.data.days * existing.data.rate,
      kategori: "operasional",
    });
    if (!result.ok) {
      return Response.json(
        { success: false, error: { code: result.code, message: "Pengeluaran tidak dapat dicatat ke buku kas." } },
        { status: 400 },
      );
    }
  }

  if (existing.kind === "termin" && status === "paid") {
    const result = createKasEntry({
      tipe: "masuk",
      deskripsi: `Pembayaran ${existing.data.name} · ${existing.data.projectName}`,
      jumlah: existing.data.amount,
      kategori: "proyek",
    });
    if (!result.ok) {
      return Response.json(
        { success: false, error: { code: result.code, message: "Penerimaan tidak dapat dicatat ke buku kas." } },
        { status: 400 },
      );
    }
  }

  const updated = updateRecordStatus(existing, status, reason);
  if (!updated) {
    return Response.json(
      { success: false, error: { code: "INVALID_FINANCE_TRANSITION", message: "Perubahan status tidak diizinkan." } },
      { status: 409 },
    );
  }
  persistKeuanganRecord(updated);
  await flushWrites();
  return Response.json({ success: true, data: updated });
}

function updateRecordStatus(
  record: KeuanganRecord,
  status: z.infer<typeof statusSchema>["status"],
  reason?: string,
): KeuanganRecord | null {
  switch (record.kind) {
    case "approval":
      if (status === "approved" || status === "rejected") {
        return {
          kind: "approval",
          data: { ...record.data, status, ...(status === "rejected" ? { rejectionReason: reason } : {}) },
        };
      }
      break;
    case "petty_cash":
      if (status === "approved") return { kind: "petty_cash", data: { ...record.data, status } };
      break;
    case "termin":
      if (status === "paid") return { kind: "termin", data: { ...record.data, status } };
      break;
    case "payroll":
      if (status === "paid") return { kind: "payroll", data: { ...record.data, status } };
      break;
  }
  return null;
}

function isAllowedTransition(record: KeuanganRecord, next: z.infer<typeof statusSchema>["status"]): boolean {
  if (record.kind === "approval") return record.data.status === "pending" && (next === "approved" || next === "rejected");
  if (record.kind === "petty_cash") return record.data.status === "pending" && next === "approved";
  return record.data.status === "unpaid" && next === "paid";
}
