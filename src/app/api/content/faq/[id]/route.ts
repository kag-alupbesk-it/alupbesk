import { faqSchema } from "../route";
import { deleteFaqItem, updateFaqItem } from "@/backend/modules/content/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = faqSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_FAQ", message: parsed.error.issues[0]?.message ?? "Data FAQ tidak valid." } }, { status: 400 });
  }
  const { id } = await params;
  const item = updateFaqItem(id, parsed.data);
  await flushWrites();
  if (!item) {
    return Response.json({ success: false, error: { code: "FAQ_NOT_FOUND", message: "FAQ tidak ditemukan." } }, { status: 404 });
  }
  return Response.json({ success: true, data: item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  if (!deleteFaqItem(id)) {
    await flushWrites();
    return Response.json({ success: false, error: { code: "FAQ_NOT_FOUND", message: "FAQ tidak ditemukan." } }, { status: 404 });
  }
  await flushWrites();
  return Response.json({ success: true, data: null });
}
