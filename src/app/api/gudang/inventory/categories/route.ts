import { z } from "zod";
import {
  createCategory,
  getCategories,
} from "@/backend/modules/gudangInventory/categories";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi."),
});

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getCategories() });
}

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = categorySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_CATEGORY",
          message: parsed.error.issues[0]?.message ?? "Data kategori tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const category = createCategory(parsed.data);

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  return Response.json({ success: true, data: category }, { status: 201 });
}
