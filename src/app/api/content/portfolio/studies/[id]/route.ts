import { caseStudySchema } from "../route";
import { updateCaseStudy, deleteCaseStudyById } from "@/services/portfolio";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const parsed = caseStudySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_CASE_STUDY", message: parsed.error.issues[0]?.message ?? "Data studi kasus tidak valid." } }, { status: 400 });
  }
  const { id } = await params;
  const study = updateCaseStudy(Number(id), parsed.data);
  await flushWrites();
  if (!study) {
    return Response.json({ success: false, error: { code: "CASE_STUDY_NOT_FOUND", message: "Studi kasus tidak ditemukan." } }, { status: 404 });
  }
  return Response.json({ success: true, data: study });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await params;
  if (!deleteCaseStudyById(Number(id))) {
    await flushWrites();
    return Response.json({ success: false, error: { code: "CASE_STUDY_NOT_FOUND", message: "Studi kasus tidak ditemukan." } }, { status: 404 });
  }
  await flushWrites();
  return Response.json({ success: true, data: null });
}
