import { z } from "zod";
import { executeCutList } from "@/backend/modules/pm/cutting";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAudit } from "@/backend/modules/audit/recordAudit";

export const dynamic = "force-dynamic";

const executeSchema = z.object({
  allocations: z
    .array(
      z.object({
        cutListItemId: z.string().min(1),
        lotId: z.string().min(1, "Lot bahan wajib dipilih."),
        quantity: z.number().positive("Jumlah potong harus lebih dari 0."),
        lengthUsed: z.number().positive().nullable().optional(),
        leftoverStatus: z.enum(["reusable", "scrap"]),
      }),
    )
    .min(1, "Minimal satu alokasi potong.")
    .max(500),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await authorizeCurrentUser(
    "/api/pm/cutting-lists/[id]/execute",
    "POST",
  );
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses eksekusi potong ditolak.",
        },
      },
      { status: access.status },
    );
  }

  const parsed = executeSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_EXECUTION",
          message: parsed.error.issues[0]?.message ?? "Data eksekusi tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  await ensureHydrated();
  const { id } = await params;
  const result = executeCutList(id, parsed.data.allocations);
  if (!result.ok) {
    const status =
      result.code === "CUT_LIST_NOT_FOUND" || result.code === "LOT_NOT_FOUND"
        ? 404
        : result.code === "INSUFFICIENT_LOT"
          ? 409
          : 400;
    return Response.json(
      { success: false, error: { code: result.code, message: result.message } },
      { status },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  recordAudit(access.profile, "EDIT", "Daftar Potong", `Mengeksekusi daftar potong ${id}`);

  return Response.json({ success: true, data: result.data });
}
