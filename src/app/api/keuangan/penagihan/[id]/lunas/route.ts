import { setPembayaranLunas } from "@/backend/modules/keuangan/index";
import { flushWrites } from "@/services/supabase";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  const result = setPembayaranLunas(id);
  await flushWrites();
  if (result.ok) {
    await recordAuditForCurrentUser("EDIT", "Penagihan Keuangan", `Menandai tagihan ${id} sebagai lunas`);
    return Response.json({ success: true, data: result.item });
  }

  return Response.json(
    { success: false, error: { code: result.code, message: "Tagihan tidak ditemukan." } },
    { status: 404 },
  );
}
