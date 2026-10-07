import { getUsersData } from "@/backend/modules/manager";

export const dynamic = "force-dynamic";

export async function GET() {
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
