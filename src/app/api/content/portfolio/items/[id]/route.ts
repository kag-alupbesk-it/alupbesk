import { portfolioItemSchema } from "../route";
import { updatePortfolioItem, deletePortfolioItemById } from "@/services/portfolio/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = portfolioItemSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_PORTFOLIO", message: parsed.error.issues[0]?.message ?? "Data portofolio tidak valid." } }, { status: 400 });
  }
  const { id } = await params;
  const item = updatePortfolioItem(Number(id), parsed.data);
  await flushWrites();
  if (!item) {
    return Response.json({ success: false, error: { code: "PORTFOLIO_NOT_FOUND", message: "Portofolio tidak ditemukan." } }, { status: 404 });
  }
  await recordAuditForCurrentUser("EDIT", "Portofolio", `Mengubah portofolio: ${item.title}`);
  return Response.json({ success: true, data: item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  if (!deletePortfolioItemById(Number(id))) {
    await flushWrites();
    return Response.json({ success: false, error: { code: "PORTFOLIO_NOT_FOUND", message: "Portofolio tidak ditemukan." } }, { status: 404 });
  }
  await flushWrites();
  await recordAuditForCurrentUser("DELETE", "Portofolio", `Menghapus portofolio (${id})`);
  return Response.json({ success: true, data: null });
}
