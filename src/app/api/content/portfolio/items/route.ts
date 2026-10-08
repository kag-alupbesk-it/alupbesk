import { z } from "zod";
import { createPortfolioItem } from "@/services/portfolio/index";
import { flushWrites } from "@/services/supabase";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const portfolioItemSchema = z.object({
  client: z.string().trim().min(1, "Nama klien wajib diisi."),
  industry: z.string().trim().min(1, "Industri wajib diisi."),
  title: z.string().trim().min(1, "Judul proyek wajib diisi."),
  challenge: z.string().trim().min(1, "Tantangan wajib diisi."),
  solution: z.string().trim().min(1, "Solusi wajib diisi."),
  result: z.string().trim().min(1, "Hasil wajib diisi."),
  img: z.string().trim().optional(),
  tags: z.array(z.string()).default([]),
  year: z.number().int().optional(),
});

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = portfolioItemSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_PORTFOLIO", message: parsed.error.issues[0]?.message ?? "Data portofolio tidak valid." } }, { status: 400 });
  }
  const item = createPortfolioItem(parsed.data);
  await flushWrites();
  return Response.json({ success: true, data: item }, { status: 201 });
}
