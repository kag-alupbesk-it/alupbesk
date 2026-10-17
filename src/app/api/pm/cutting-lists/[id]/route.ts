import { z } from "zod";
import {
  deleteCutList,
  getCutListById,
  updateCutList,
} from "@/backend/modules/pm/cutting";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  componentName: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive(),
  length: z.number().positive().nullable().optional(),
  width: z.number().positive().nullable().optional(),
  materialItemId: z.string().nullable().optional(),
  note: z.string().max(2000).optional(),
});

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
  items: z.array(itemSchema).min(1).max(200).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser("/api/pm/cutting-lists/[id]", "GET");
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
  const { id } = await params;
  const list = getCutListById(id);
  if (!list) {
    return Response.json(
      { success: false, error: { code: "CUT_LIST_NOT_FOUND", message: "Daftar potong tidak ditemukan." } },
      { status: 404 },
    );
  }
  return Response.json(
    { success: true, data: list },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser("/api/pm/cutting-lists/[id]", "PATCH");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses mengubah daftar potong ditolak.",
        },
      },
      { status: access.status },
    );
  }

  const parsed = updateSchema.safeParse(await readJsonBody(request));
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
  const { id } = await params;
  const result = updateCutList(id, parsed.data);
  if (!result.ok) {
    const notFound = result.code === "CUT_LIST_NOT_FOUND";
    return Response.json(
      { success: false, error: { code: result.code, message: result.message } },
      { status: notFound ? 404 : 409 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  recordAudit(access.profile, "EDIT", "Daftar Potong", `Mengubah daftar potong ${id}`);

  return Response.json({ success: true, data: result.data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser("/api/pm/cutting-lists/[id]", "DELETE");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses menghapus daftar potong ditolak.",
        },
      },
      { status: access.status },
    );
  }

  await ensureHydrated();
  const { id } = await params;
  const result = deleteCutList(id);
  if (!result.ok) {
    return Response.json(
      { success: false, error: { code: result.code, message: result.message } },
      { status: 404 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  recordAudit(access.profile, "DELETE", "Daftar Potong", `Menghapus daftar potong ${id}`);

  return Response.json({ success: true, data: result.data });
}
