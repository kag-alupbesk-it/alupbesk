import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";
import { getRoleRequests } from "@/backend/modules/roleRequests";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeCurrentUser("/api/owner/role-requests", "GET");
  if (!access.profile) {
    return Response.json(
      {
        success: false,
        error: {
          code: access.status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message: "Hanya Owner yang dapat melihat permintaan role.",
        },
      },
      { status: access.status },
    );
  }

  try {
    return Response.json(
      { success: true, data: await getRoleRequests() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    return Response.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "DATABASE_ERROR",
          message: "Permintaan role gagal dimuat.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}
