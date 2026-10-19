import { z } from "zod";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { gudangInventoryItems, persistInventoryItem } from "@/backend/modules/gudangInventory/items/store";
import { persistMaterialLot } from "@/backend/modules/gudangInventory/lots/store";
import { recomputeMaterialStock } from "@/backend/modules/gudangInventory/lots/recomputeStock";
import { createInTransaction } from "@/backend/modules/gudangInventory/transactions/createInTransaction";
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
  quantity: z.number().positive().optional(),
  transactionDate: z.string().optional(),
  createdBy: z.string().optional(),

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
  const existing = itemId ? gudangInventoryItems.get(itemId) : undefined;
  if (itemId && !existing) {
    return Response.json({ success: false, error: "Barang tidak ditemukan" }, { status: 404 });
  }
  const materialKind = existing?.materialKind ?? data.materialKind;
  const isUnit = materialKind === "unit";

  // 1. Create Item if missing (stok awal 0; stok bertambah via transaksi di bawah).
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

  const lotTotal = data.lots.reduce((sum, lot) => sum + lot.quantity, 0);
  // Barang satuan memakai quantity eksplisit (atau total lot); bahan selalu derive dari lot.
  const receivedQty = isUnit ? data.quantity ?? lotTotal : lotTotal;

  // 2. Catat riwayat barang masuk + tambah stok master.
  let transactionId: string | null = null;
  if (receivedQty > 0) {
    const result = createInTransaction({
      transactionDate: data.transactionDate || new Date().toISOString().slice(0, 10),
      itemId,
      quantity: receivedQty,
      createdBy: data.createdBy || "",
    });
    if (!result.ok) {
      return Response.json({ success: false, error: "Barang tidak ditemukan" }, { status: 404 });
    }
    transactionId = result.data.id;
  }

  // 3. Add Lots
  for (const lot of data.lots) {
    persistMaterialLot({
      id: `lot-${Date.now()}-${Math.random()}`,
      itemId: itemId,
      lotCode: lot.lotCode || `LOT-${Date.now()}`,
      receivedDate: new Date().toISOString().split('T')[0],
      inTransactionId: transactionId,
      length: lot.length ?? null,
      width: lot.width ?? null,
      quantity: lot.quantity,
      rackGroup: lot.rackGroup,
      subRow: lot.subRow,
      status: "tersedia",
      note: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 4. Sinkronkan stok bahan dari lot (no-op untuk barang satuan).
  recomputeMaterialStock(itemId);

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("CREATE", "Penerimaan Barang Cepat", `Menerima barang: ${data.itemName}`);
  return Response.json({ success: true, data: { itemId, receivedQty } });
}
