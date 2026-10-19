import { z } from "zod";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { persistInventoryItem } from "@/backend/modules/gudangInventory/items/store";
import { persistMaterialLot } from "@/backend/modules/gudangInventory/lots/store";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

export const quickReceiveSchema = z.object({
  itemId: z.string().optional(),
  categoryId: z.string().optional(),
  itemName: z.string().min(1),
  brand: z.string().optional(),
  modelNo: z.string().optional(),
  color: z.string().optional(),
  unit: z.string().default("pcs"),
  materialKind: z.enum(["unit", "bar", "sheet", "roll"]).default("unit"),
  
  lots: z.array(z.object({
    length: z.number().nullable().optional(),
    width: z.number().nullable().optional(),
    quantity: z.number().positive(),
    rackGroup: z.string().default(""),
    subRow: z.string().default(""),
    lotCode: z.string().optional(),
  })).default([]),
});

export async function POST(request: Request) {
  await ensureHydrated();
  const body = await request.json();
  const parsed = quickReceiveSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Data tidak valid" }, { status: 400 });
  }

  const { data } = parsed;
  let itemId = data.itemId;

  // 1. Create Item if missing
  if (!itemId) {
    if (!data.categoryId) return Response.json({ success: false, error: "Kategori wajib" }, { status: 400 });
    itemId = `gd-${Date.now()}`;
    persistInventoryItem({
      id: itemId,
      categoryId: data.categoryId,
      itemName: data.itemName,
      brand: data.brand || "",
      modelNo: data.modelNo || "",
      color: data.color || "",
      rackGroup: "",
      subRow: "",
      currentStock: 0,
      unit: data.unit,
      materialKind: data.materialKind,
      lengthPerUnit: null,
      widthPerUnit: null,
      weightPerUnit: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 2. Add Lots
  for (const lot of data.lots) {
    persistMaterialLot({
      id: `lot-${Date.now()}-${Math.random()}`,
      itemId: itemId,
      lotCode: lot.lotCode || `LOT-${Date.now()}`,
      receivedDate: new Date().toISOString().split('T')[0],
      inTransactionId: null,
      length: lot.length || null,
      width: lot.width || null,
      quantity: lot.quantity,
      rackGroup: lot.rackGroup,
      subRow: lot.subRow,
      status: "tersedia",
      note: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("CREATE", "Penerimaan Barang Cepat", `Menerima barang: ${data.itemName}`);
  return Response.json({ success: true, data: { itemId } });
}
