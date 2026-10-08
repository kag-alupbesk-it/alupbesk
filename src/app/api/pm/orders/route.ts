import { z } from "zod";
import { createPMOrder, listPMOrders } from "@/backend/modules/pm/index";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  contractorName: z.string().trim().min(1).max(160),
  contractorCode: z.string().trim().min(1).max(80),
  contractorPhone: z.string().trim().max(40).optional(),
  projectAddress: z.string().trim().max(500).optional(),
  targetDate: z.string().date(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        quantity: z.number().int().positive(),
        unit: z.string().trim().min(1).max(40),
        technicalNote: z.string().max(2000),
      }),
    )
    .min(1)
    .max(100),
  rawImage: z.string().url().max(2048).optional(),
  rawImageName: z.string().max(255).optional(),
});

export async function GET() {
  const access = await authorizeCurrentUser("/api/pm/orders", "GET");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Akses data proyek ditolak.",
        },
      },
      { status: access.status },
    );
  }
  try {
    const orders = await listPMOrders();
    return Response.json(
      { success: true, data: orders },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    console.error("[api/pm/orders] gagal memuat order:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR",
          message: unavailable
            ? "Database belum dikonfigurasi."
            : "Order PM gagal dimuat.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}

export async function POST(request: Request) {
  const access = await authorizeCurrentUser("/api/pm/orders", "POST");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Hanya role proyek yang dapat membuat order.",
        },
      },
      { status: access.status },
    );
  }
  if (access.profile.role !== "proyek" && access.profile.role !== "manager" && access.profile.role !== "owner") {
    return Response.json(
      { success: false, error: { code: "ROLE_FORBIDDEN", message: "Hanya role proyek yang dapat membuat order." } },
      { status: 403 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Isi request bukan JSON yang valid." },
      },
      { status: 400 },
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_ORDER",
          message: parsed.error.issues[0]?.message ?? "Data order tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await createPMOrder(parsed.data);
    if (!result.ok) {
      return Response.json(
        {
          success: false,
          error: { code: result.code, message: result.message },
        },
        { status: result.code === "DATABASE_UNAVAILABLE" ? 503 : 500 },
      );
    }
    return Response.json(
      { success: true, data: result.order },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[api/pm/orders] gagal membuat order:", error);
    return Response.json(
      {
        success: false,
        error: { code: "DATABASE_ERROR", message: "Order gagal disimpan." },
      },
      { status: 500 },
    );
  }
}
