import { z } from "zod";
import { createUser, getUsersData } from "@/backend/modules/manager/index";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

export const dynamic = "force-dynamic";
const roles = [
  "pelanggan",
  "marketing",
  "gudang",
  "keuangan",
  "proyek",
  "field",
  "produksi",
  "manager",
  "owner",
] as const;
const userSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(255),
  dept: z.string().trim().max(120),
  role: z.enum(roles),
});

export async function GET() {
  const access = await authorizeCurrentUser("/api/manager/users", "GET");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Akses ke data pengguna ditolak." } },
      { status: access.status },
    );
  }
  try {
    return Response.json(
      { success: true, data: await getUsersData() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR",
          message: "Data pengguna gagal dimuat.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}

export async function POST(request: Request) {
  const access = await authorizeCurrentUser("/api/manager/users", "POST");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Akses mengubah pengguna ditolak." } },
      { status: access.status },
    );
  }
  const parsed = userSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_USER", message: parsed.error.issues[0]?.message ?? "Data pengguna tidak valid." } },
      { status: 400 },
    );
  }
  try {
    const user = await createUser(parsed.data, access.profile.role);
    return Response.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    const forbidden = error instanceof Error && error.message === "ROLE_FORBIDDEN";
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    const duplicate = error && typeof error === "object" && "code" in error && error.code === "23505";
    return Response.json(
      {
        success: false,
        error: {
          code: forbidden ? "ROLE_FORBIDDEN" : unavailable ? "DATABASE_UNAVAILABLE" : duplicate ? "EMAIL_EXISTS" : "DATABASE_ERROR",
          message: forbidden ? "Hanya Owner yang dapat memberikan role Manager atau Owner." : duplicate ? "Email sudah digunakan." : "Pengguna gagal disimpan.",
        },
      },
      { status: forbidden ? 403 : unavailable ? 503 : duplicate ? 409 : 500 },
    );
  }
}
