import { z } from "zod";
import { getFinanceDashboard, saveFinanceDashboard } from "@/backend/modules/keuangan/dashboard";

export const dynamic = "force-dynamic";

const stateSchema = z.object({
  transaksi: z.array(z.unknown()).max(10000),
  invoice: z.array(z.unknown()).max(5000),
  karyawan: z.array(z.unknown()).max(5000),
  opsiJabatan: z.array(z.string().max(120)).max(500),
  opsiPerson: z.array(z.string().max(160)).max(500),
  opsiKategori: z.array(z.string().max(120)).max(500),
  opsiPos: z.array(z.string().max(160)).max(500),
  seq: z.number().int().positive(),
  seqKaryawan: z.number().int().positive(),
});

export async function GET() {
  try {
    return Response.json({ success: true, data: await getFinanceDashboard() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json({ success: false, error: { code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR", message: "Data keuangan gagal dimuat." } }, { status: unavailable ? 503 : 500 });
  }
}

export async function PUT(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return Response.json({ success: false, error: { code: "INVALID_JSON", message: "Data tidak valid." } }, { status: 400 }); }
  const parsed = stateSchema.safeParse(payload);
  if (!parsed.success || JSON.stringify(parsed.data).length > 2_000_000) {
    return Response.json({ success: false, error: { code: "INVALID_STATE", message: "Data keuangan tidak valid atau terlalu besar." } }, { status: 400 });
  }
  try {
    const data = await saveFinanceDashboard(parsed.data);
    return Response.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    console.error("[api/keuangan/finance-store] gagal menyimpan state:", error);
    return Response.json({ success: false, error: { code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR", message: "Perubahan keuangan gagal disimpan." } }, { status: unavailable ? 503 : 500 });
  }
}
