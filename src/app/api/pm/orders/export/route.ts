import { NextResponse } from "next/server";
import { generatePMOrdersExcel, listPMOrders } from "@/backend/modules/pm";
import { authorizeCurrentUser } from "@/backend/auth/authorizeCurrentUser";

export const dynamic = "force-dynamic";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET() {
  const access = await authorizeCurrentUser("/api/pm/orders", "GET");
  if (!access.profile) {
    return NextResponse.json(
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
    const { buffer, filename } = await generatePMOrdersExcel(orders);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": XLSX_CONTENT_TYPE,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const unavailable = error instanceof Error && error.message === "DATABASE_UNAVAILABLE";
    console.error("[api/pm/orders/export] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: unavailable ? "DATABASE_UNAVAILABLE" : "EXPORT_FAILED",
          message: unavailable
            ? "Database belum dikonfigurasi."
            : "Gagal mengekspor pesanan.",
        },
      },
      { status: unavailable ? 503 : 500 },
    );
  }
}
