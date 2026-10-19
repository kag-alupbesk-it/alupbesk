import { z } from "zod";
import {
  createInTransaction,
  createOutTransaction,
  getInTransactions,
  getOutTransactions,
} from "@/backend/modules/gudangInventory/transactions";
import { getInventoryItemById, resolveInventoryItem } from "@/backend/modules/gudangInventory/items";
import type { GudangInventoryErrorCode } from "@/backend/modules/gudangInventory";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { getAuthenticatedProfile } from "@/backend/auth/getAuthenticatedProfile";
import { logAuditAction } from "@/backend/modules/audit/auditStore";
import { createMaterialLot, recomputeMaterialStock } from "@/backend/modules/gudangInventory/lots";

const itemDetailSchema = {
  itemId: z.string().optional(),
  categoryId: z.string().optional(),
  itemName: z.string().optional(),
  brand: z.string().optional(),
  modelNo: z.string().optional(),
  color: z.string().optional(),
  rackGroup: z.string().optional(),
  subRow: z.string().optional(),
  unit: z.string().optional(),
  materialKind: z.enum(["unit", "bar", "sheet", "roll"]).optional(),
  lengthPerUnit: z.number().nullable().optional(),
  widthPerUnit: z.number().nullable().optional(),
  weightPerUnit: z.number().nullable().optional(),
};

const lotSchema = z.object({
  length: z.number().positive().nullable().optional(),
  width: z.number().positive().nullable().optional(),
  quantity: z.number().positive("Jumlah lot harus lebih dari 0."),
  rackGroup: z.string().optional(),
  subRow: z.string().optional(),
  lotCode: z.string().optional(),
});

interface ItemReference {
  itemId?: string;
  categoryId?: string;
  itemName?: string;
}

function hasItemReference(value: ItemReference): boolean {
  if (value.itemId) return true;
  return Boolean(value.categoryId && value.itemName && value.itemName.trim());
}

const transactionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("in"),
    transactionDate: z.string().min(1, "Tanggal wajib diisi."),
    quantity: z.number().positive("Jumlah harus lebih dari 0."),
    ...itemDetailSchema,
    lots: z.array(lotSchema).optional(),
    createdBy: z.string().optional(),
  }),
  z.object({
    type: z.literal("out"),
    transactionDate: z.string().min(1, "Tanggal wajib diisi."),
    quantity: z.number().positive("Jumlah harus lebih dari 0."),
    ...itemDetailSchema,
    projectId: z.string().nullable().optional(),
    projectName: z.string().optional(),
    createdBy: z.string().optional(),
  }),
]);

const ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  ITEM_NOT_FOUND: { status: 404, message: "Barang tidak ditemukan." },
  CATEGORY_NOT_FOUND: { status: 400, message: "Kategori tidak ditemukan." },
  INSUFFICIENT_STOCK: { status: 409, message: "Stok tidak mencukupi." },
};

type ResolvedItem = { ok: true; id: string } | { ok: false; code: GudangInventoryErrorCode };

// Menentukan barang transaksi: pakai itemId bila ada, atau cari/buat barang
// baru dari detail yang dikirim form (auto-buat bila belum terdaftar).
function resolveItemId(input: ItemReference & {
  brand?: string;
  modelNo?: string;
  color?: string;
  rackGroup?: string;
  subRow?: string;
  unit?: string;
  materialKind?: "unit" | "bar" | "sheet" | "roll";
  lengthPerUnit?: number | null;
  widthPerUnit?: number | null;
  weightPerUnit?: number | null;
}): ResolvedItem {
  if (input.itemId) {
    return getInventoryItemById(input.itemId)
      ? { ok: true, id: input.itemId }
      : { ok: false, code: "ITEM_NOT_FOUND" };
  }
  const resolved = resolveInventoryItem({
    categoryId: input.categoryId ?? "",
    itemName: input.itemName ?? "",
    brand: input.brand,
    modelNo: input.modelNo,
    color: input.color,
    rackGroup: input.rackGroup,
    subRow: input.subRow,
    unit: input.unit,
    materialKind: input.materialKind,
    lengthPerUnit: input.lengthPerUnit,
    widthPerUnit: input.widthPerUnit,
    weightPerUnit: input.weightPerUnit,
  });
  return resolved.ok ? { ok: true, id: resolved.data.id } : { ok: false, code: resolved.code };
}

export async function GET() {
  await ensureHydrated();
  return Response.json({
    success: true,
    data: {
      inTransactions: getInTransactions(),
      outTransactions: getOutTransactions(),
    },
  });
}

export async function POST(request: Request) {
  await ensureHydrated();
  const parsed = transactionSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_TRANSACTION",
          message: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid.",
        },
      },
      { status: 400 },
    );
  }

  if (!hasItemReference(parsed.data)) {
    return Response.json(
      {
        success: false,
        error: { code: "INVALID_TRANSACTION", message: "Nama barang wajib diisi." },
      },
      { status: 400 },
    );
  }

  const resolved = resolveItemId(parsed.data);
  if (!resolved.ok) {    const mapped = ERROR_MESSAGES[resolved.code] ?? {
      status: 400,
      message: "Barang tidak valid.",
    };
    return Response.json(
      { success: false, error: { code: resolved.code, message: mapped.message } },
      { status: mapped.status },
    );
  }

  const profile = await getAuthenticatedProfile();
  const createdBy = parsed.data.createdBy?.trim() || profile?.name || "Admin Gudang";

  const item = getInventoryItemById(resolved.id);
  const isMaterialIn = parsed.data.type === "in" && item?.materialKind !== "unit";
  const lots = parsed.data.type === "in" ? parsed.data.lots ?? [] : [];

  if (isMaterialIn && lots.length === 0) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_TRANSACTION",
          message: "Barang bahan wajib diisi minimal satu lot.",
        },
      },
      { status: 400 },
    );
  }

  const effectiveQuantity = isMaterialIn
    ? lots.reduce((sum, lot) => sum + lot.quantity, 0)
    : parsed.data.quantity;

  const result =
    parsed.data.type === "in"
      ? createInTransaction({
          transactionDate: parsed.data.transactionDate,
          itemId: resolved.id,
          quantity: effectiveQuantity,
          createdBy,
        })
      : createOutTransaction({
          transactionDate: parsed.data.transactionDate,
          itemId: resolved.id,
          quantity: parsed.data.quantity,
          projectId: parsed.data.projectId ?? null,
          projectName: parsed.data.projectName,
          createdBy,
        });

  if (!result.ok) {
    const mapped = ERROR_MESSAGES[result.code] ?? {
      status: 400,
      message: "Transaksi gagal disimpan.",
    };
    return Response.json(
      { success: false, error: { code: result.code, message: mapped.message } },
      { status: mapped.status },
    );
  }

  if (isMaterialIn) {
    for (const lot of lots) {
      createMaterialLot({
        itemId: resolved.id,
        inTransactionId: result.data.id,
        receivedDate: parsed.data.transactionDate,
        lotCode: lot.lotCode,
        length: lot.length ?? null,
        width: lot.width ?? null,
        quantity: lot.quantity,
        rackGroup: lot.rackGroup,
        subRow: lot.subRow,
      });
    }
    recomputeMaterialStock(resolved.id);
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  logAuditAction({
    profile,
    action: "CREATE",
    target: parsed.data.type === "in" ? "Transaksi Masuk Gudang" : "Transaksi Keluar Gudang",
    details:
      parsed.data.type === "in"
        ? `Mencatat barang masuk sebanyak ${effectiveQuantity}${isMaterialIn ? ` (${lots.length} lot)` : ""}`
        : `Mencatat barang keluar sebanyak ${parsed.data.quantity}${parsed.data.projectName ? ` untuk ${parsed.data.projectName}` : ""}`,
  });

  return Response.json({ success: true, data: result.data }, { status: 201 });
}
