import { NextResponse } from "next/server";
import {
  generateInventoryInExcel,
  generateInventoryItemsExcel,
  generateInventoryOutExcel,
} from "@/backend/modules/gudangInventory/excel";
import { getCategories } from "@/backend/modules/gudangInventory/categories";
import { getInventoryItems } from "@/backend/modules/gudangInventory/items";
import {
  getInTransactions,
  getOutTransactions,
} from "@/backend/modules/gudangInventory/transactions";
import { ensureHydrated } from "@/services/supabaseHydrate";

export const dynamic = "force-dynamic";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(request: Request) {
  try {
    await ensureHydrated();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "items";

    const generated =
      type === "in"
        ? await generateInventoryInExcel(getInTransactions())
        : type === "out"
          ? await generateInventoryOutExcel(getOutTransactions())
          : await generateInventoryItemsExcel(
              getInventoryItems(),
              new Map(getCategories().map((category) => [category.id, category.name])),
            );

    return new NextResponse(new Uint8Array(generated.buffer), {
      status: 200,
      headers: {
        "Content-Type": XLSX_CONTENT_TYPE,
        "Content-Disposition": `attachment; filename="${generated.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/gudang/inventory/export] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "EXPORT_FAILED", message: "Gagal mengekspor data gudang." },
      },
      { status: 500 },
    );
  }
}
