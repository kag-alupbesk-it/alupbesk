import { deleteInventoryItem, updateInventoryItem } from "@/backend/modules/gudangInventory/items";
import { readJsonBody } from "@/backend/http/readJsonBody";
import { flushWritesOrError } from "@/backend/http/flushWritesOrError";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { inventoryItemSchema } from "../route";
import { recordAuditForCurrentUser } from "@/backend/modules/audit/recordAudit";

const updateSchema = inventoryItemSchema.partial();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureHydrated();
  const parsed = updateSchema.safeParse(await readJsonBody(request));
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

  const { id } = await params;
  const result = updateInventoryItem(id, parsed.data);
  if (!result.ok) {
    const notFound = result.code === "ITEM_NOT_FOUND";
    const duplicate = result.code === "DUPLICATE_MODEL";
    const kindLocked = result.code === "MATERIAL_KIND_LOCKED";
    const status = notFound ? 404 : duplicate || kindLocked ? 409 : 400;
    return Response.json(
      {
        success: false,
        error: {
          code: result.code,
          message: notFound
            ? "Barang tidak ditemukan."
            : duplicate
              ? "Nomor model sudah terdaftar di gudang."
              : kindLocked
                ? "Jenis bahan tidak dapat diubah karena barang sudah memiliki stok atau lot."
                : "Kategori tidak ditemukan.",
        },
      },
      { status },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("EDIT", "Barang Gudang", `Mengubah barang gudang (${id})`);
  return Response.json({ success: true, data: result.data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureHydrated();
  const { id } = await params;
  const result = deleteInventoryItem(id);
  if (!result.ok) {
    return Response.json(
      {
        success: false,
        error: { code: "ITEM_NOT_FOUND", message: "Barang tidak ditemukan." },
      },
      { status: 404 },
    );
  }

  const flushError = await flushWritesOrError();
  if (flushError) return flushError;

  await recordAuditForCurrentUser("DELETE", "Barang Gudang", `Menghapus barang gudang (${id})`);
  return Response.json({ success: true, data: result.data });
}
