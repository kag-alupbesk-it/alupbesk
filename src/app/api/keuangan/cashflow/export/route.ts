import { NextResponse } from "next/server";
import { getKasData } from "@/backend/modules/keuangan/kas/getKasData";
import { generateCashflowExcel } from "@/backend/modules/keuangan/export/generateCashflowExcel";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureHydrated();
    const kasData = getKasData();

    const all = [
      ...kasData.masuk.map((m) => ({ ...m, jenis: "kas_masuk" as const, person: "", noNota: m.sumber })),
      ...kasData.keluar.map((k) => ({ ...k, jenis: "kas_keluar" as const, person: "", noNota: k.sumber })),
    ];

    const { buffer, filename } = await generateCashflowExcel(all);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/keuangan/cashflow/export] error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Gagal mengekspor cash flow" } },
      { status: 500 }
    );
  }
}
