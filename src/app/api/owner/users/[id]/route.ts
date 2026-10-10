import { deleteUser } from "@/backend/modules/manager/index";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const access = await authorizeCurrentUser("/api/owner/users/[id]", "DELETE");
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

export const dynamic = "force-dynamic";