import { z } from "zod";
import { createFaqItem, getFaqItems } from "@/backend/modules/content";
import { flushWrites } from "@/services/supabase";

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi."),
  answer: z.string().trim().min(1, "Jawaban wajib diisi."),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export async function GET() {
  return Response.json({ success: true, data: getFaqItems() });
}

export async function POST(request: Request) {
  const parsed = faqSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ success: false, error: { code: "INVALID_FAQ", message: parsed.error.issues[0]?.message ?? "Data FAQ tidak valid." } }, { status: 400 });
  }
  const item = createFaqItem(parsed.data);
  await flushWrites();
  return Response.json({ success: true, data: item }, { status: 201 });
}
