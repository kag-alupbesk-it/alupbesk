import { z } from "zod";
import { deleteUser, updateUser } from "@/backend/modules/manager";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

type Context = { params: Promise<{ id: string }> };
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
const schema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(255),
  dept: z.string().trim().max(120),
  role: z.enum(roles),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]),
});

export async function PUT(request: Request, { params }: Context) {
  const access = await authorizeCurrentUser("/api/manager/users/[id]", "PUT");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Akses mengubah pengguna ditolak." } },
      { status: access.status },
    );
  }
  const parsed = schema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_USER", message: parsed.error.issues[0]?.message ?? "Data pengguna tidak valid." } },
      { status: 400 },
    );
  }
  const { id } = await params;
  if (access.profile.id === id) {
    return Response.json(
      { success: false, error: { code: "ROLE_FORBIDDEN", message: "Tidak dapat mengubah profil akun yang sedang digunakan." } },
      { status: 403 },
    );
  }
  try {
    const user = await updateUser(id, parsed.data, access.profile.role);
    return user
      ? Response.json({ success: true, data: user })
      : Response.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Pengguna tidak ditemukan." } }, { status: 404 });
  } catch (error) {
    const forbidden = error instanceof Error && error.message === "ROLE_FORBIDDEN";
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    const duplicate = error && typeof error === "object" && "code" in error && error.code === "23505";
    return Response.json(
      {
        success: false,
        error: {
          code: forbidden
            ? "ROLE_FORBIDDEN"
            : unavailable
              ? "DATABASE_UNAVAILABLE"
              : duplicate
                ? "EMAIL_EXISTS"
                : "DATABASE_ERROR",
          message: forbidden
            ? "Hanya Owner yang dapat menyetujui aktivasi akun atau mengubah role."
            : duplicate
              ? "Email sudah digunakan."
              : "Perubahan pengguna gagal disimpan.",
        },
      },
      { status: forbidden ? 403 : unavailable ? 503 : duplicate ? 409 : 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const access = await authorizeCurrentUser("/api/manager/users/[id]", "DELETE");
  if (!access.profile) {
    return Response.json(
      { success: false, error: { code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN", message: "Akses menghapus pengguna ditolak." } },
      { status: access.status },
    );
  }
  const { id } = await params;
  if (access.profile.id === id) {
    return Response.json(
      { success: false, error: { code: "ROLE_FORBIDDEN", message: "Tidak dapat menghapus profil akun yang sedang digunakan." } },
      { status: 403 },
    );
  }
  try {
    const deleted = await deleteUser(id, access.profile.role);
    return deleted
      ? Response.json({ success: true, data: null })
      : Response.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Pengguna tidak ditemukan." } }, { status: 404 });
  } catch (error) {
    const forbidden = error instanceof Error && error.message === "ROLE_FORBIDDEN";
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      { success: false, error: { code: forbidden ? "ROLE_FORBIDDEN" : unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR", message: forbidden ? "Hanya Owner yang dapat menghapus role Manager atau Owner." : "Pengguna gagal dihapus." } },
      { status: forbidden ? 403 : unavailable ? 503 : 500 },
    );
  }
}
