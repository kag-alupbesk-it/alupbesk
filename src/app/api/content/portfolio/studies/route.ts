import { z } from "zod";
import { createCaseStudy } from "@/services/portfolio";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const caseStudySchema = z.object({
  client: z.string().trim().min(1, "Nama klien wajib diisi."),
  logo: z.string().trim().default(""),
  industry: z.string().trim().min(1, "Industri wajib diisi."),
  title: z.string().trim().min(1, "Judul wajib diisi."),
  desc: z.string().trim().default(""),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  img: z.string().trim().optional(),
  year: z.number().int().optional(),
});

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = caseStudySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_CASE_STUDY", message: parsed.error.issues[0]?.message ?? "Data studi kasus tidak valid." } }, { status: 400 });
  }
  const study = createCaseStudy(parsed.data);
  await flushWrites();
  return Response.json({ success: true, data: study }, { status: 201 });
}
