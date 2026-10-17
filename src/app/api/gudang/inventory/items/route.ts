import { z } from "zod";
import {
  createInventoryItem,
  getInventoryItems,
} from "@/backend/modules/gudangInventory/items";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

export const inventoryItemSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  itemName: z.string().min(1, "Nama barang wajib diisi."),
  brand: z.string().optional(),
  modelNo: z.string().optional(),
  color: z.string().optional(),
  rackGroup: z.string().optional(),
  subRow: z.string().optional(),
  currentStock: z.number().min(0, "Stok tidak boleh negatif.").optional(),
  unit: z.string().optional(),
  materialKind: z.enum(["unit", "bar", "sheet", "roll"]).optional(),
  lengthPerUnit: z.number().positive().nullable().optional(),
  widthPerUnit: z.number().positive().nullable().optional(),
  weightPerUnit: z.number().positive().nullable().optional(),
});

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: getInventoryItems() });
}

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = inventoryItemSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_INVENTORY_ITEM",
          message: parsed.error.issues[0]?.message ?? "Data barang tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  const result = createInventoryItem(parsed.data);
  if (!result.ok) {
    const duplicate = result.code === "DUPLICATE_MODEL";
    return Response.json(
      {
        success: false,
        error: {
          code: result.code,
          message: duplicate
            ? "Nomor model sudah terdaftar di gudang."
            : "Kategori tidak ditemukan.",
        },
      },
      { status: duplicate ? 409 : 400 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("CREATE", "Barang Gudang", `Menambahkan barang gudang: ${parsed.data.itemName}`);
  return Response.json({ success: true, data: result.data }, { status: 201 });
}
