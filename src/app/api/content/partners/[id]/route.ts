import { partnerSchema } from "../route";
import { deletePartner, updatePartner } from "@/backend/modules/content/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = partnerSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_PARTNER", message: parsed.error.issues[0]?.message ?? "Data mitra tidak valid." } }, { status: 400 });
  }
  const { id } = await params;
  const partner = updatePartner(id, parsed.data);
  await flushWrites();
  if (!partner) {
    return Response.json({ success: false, error: { code: "PARTNER_NOT_FOUND", message: "Mitra tidak ditemukan." } }, { status: 404 });
  }
  return Response.json({ success: true, data: partner });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  if (!deletePartner(id)) {
    await flushWrites();
    return Response.json({ success: false, error: { code: "PARTNER_NOT_FOUND", message: "Mitra tidak ditemukan." } }, { status: 404 });
  }
  await flushWrites();
  return Response.json({ success: true, data: null });
}
