import { z } from "zod";
import { createCutList, listCutLists } from "@/backend/modules/pm/cutting";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  componentName: z.string().trim().min(1, "Nama komponen wajib diisi.").max(200),
  quantity: z.number().int().positive("Jumlah harus lebih dari 0."),
  length: z.number().positive().nullable().optional(),
  width: z.number().positive().nullable().optional(),
  materialItemId: z.string().nullable().optional(),
  note: z.string().max(2000).optional(),
});

const createSchema = z.object({
  orderId: z.string().min(1, "SPK wajib dipilih."),
  title: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
  items: z.array(itemSchema).min(1, "Minimal satu item potong.").max(200),
});

export async function GET(request: Request) {
  const access = await authorizeCurrentUser("/api/pm/cutting-lists", "GET");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses daftar potong ditolak.",
        },
      },
      { status: access.status },
    );
  }
  await ensureHydrated();
  const orderId = new URL(request.url).searchParams.get("orderId") ?? undefined;
  return Response.json(
    { success: true, data: listCutLists(orderId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const access = await authorizeCurrentUser("/api/pm/cutting-lists", "POST");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses membuat daftar potong ditolak.",
        },
      },
      { status: access.status },
    );
  }

  const parsed = createSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_CUT_LIST",
          message: parsed.error.issues[0]?.message ?? "Data daftar potong tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  await ensureHydrated();
  const result = await createCutList(parsed.data, access.profile.name);
  if (!result.ok) {
    return Response.json(
      { success: false, error: { code: result.code, message: result.message } },
      { status: result.code === "ORDER_NOT_FOUND" ? 404 : 500 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  return Response.json({ success: true, data: result.data }, { status: 201 });
}
