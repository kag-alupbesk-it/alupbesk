import { Router } from "express";
import { z } from "zod";
import { getGudangItems, updateGudangStock, getGudangMovements, createGudangMasuk, createGudangKeluar, createGudangItem, getGudangOrders, processGudangOrder, completeGudangOrder } from ".";

const router = Router();

const gudangItemSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi."),
  jenisBarang: z.string().min(1, "Jenis barang wajib diisi."),
  kategoriBarang: z.enum(["eceran", "proyek"], { message: "Kategori barang tidak valid." }),
  satuan: z.string().min(1, "Satuan wajib diisi."),
  merek: z.string().min(1, "Merek wajib diisi."),
  warna: z.string().min(1, "Warna wajib diisi."),
  seksiLokasi: z.string().min(1, "Lokasi / seksi wajib diisi."),
  stokAwal: z.number().int().min(0, "Stok awal tidak boleh negatif."),
  minStok: z.number().int().min(0, "Minimum stok tidak boleh negatif."),
  proyek: z.string().optional(),
  catatan: z.string().optional(),
  sumberAwal: z.string().optional(),
});

const gudangStockSchema = z.object({
  stok: z.number().int().min(0, "Stok tidak boleh negatif."),
  minStok: z.number().int().min(0, "Minimum stok tidak boleh negatif."),
});

const gudangMasukSchema = z.object({
  jumlah: z.number().int().positive("Jumlah barang masuk harus lebih dari nol."),
  tanggal: z.string().min(1, "Tanggal wajib diisi."),
  sumber: z.string().min(1, "Sumber barang (supplier/tengkulak) wajib diisi."),
  buktiNota: z.string().optional(),
  catatan: z.string().optional(),
});

const gudangKeluarSchema = z.object({
  jumlah: z.number().int().positive("Jumlah barang keluar harus lebih dari nol."),
  tanggal: z.string().min(1, "Tanggal wajib diisi."),
  tujuan: z.string().min(1, "Tujuan barang (proyek/penjualan) wajib diisi."),
  penerima: z.string().min(1, "Penerima barang wajib diisi."),
  catatan: z.string().optional(),
});

function movementFailure(response: { status: (code: number) => { json: (body: unknown) => unknown } }, result: { ok: false; code: string }) {
  if (result.code === "GUDANG_ITEM_NOT_FOUND")
    return response.status(404).json({ success: false, error: { code: result.code, message: "Barang tidak ditemukan." } });
  return response.status(400).json({ success: false, error: { code: result.code, message: "Stok tidak cukup untuk barang keluar." } });
}

router.get("/items", (_request, response) =>
  response.json({ success: true, data: getGudangItems() }),
);
router.post("/items", (request, response) => {
  const parsed = gudangItemSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_GUDANG_ITEM",
          message: parsed.error.issues[0]?.message ?? "Data barang tidak valid.",
        },
      });
  const result = createGudangItem(parsed.data);
  if (!result.ok)
    return response
      .status(409)
      .json({
        success: false,
        error: {
          code: "DUPLICATE_SKU",
          message: "SKU sudah terdaftar di gudang.",
        },
      });
  return response.status(201).json({ success: true, data: result.item });
});
router.put("/items/:id", (request, response) => {
  const parsed = gudangStockSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_GUDANG_STOCK",
          message: "Data stok tidak valid.",
        },
      });
  const item = updateGudangStock(request.params.id, parsed.data);
  return item
    ? response.json({ success: true, data: item })
    : response
        .status(404)
        .json({
          success: false,
          error: {
            code: "GUDANG_ITEM_NOT_FOUND",
            message: "Barang tidak ditemukan.",
          },
        });
});

// Riwayat pergerakan barang masuk & keluar
router.get("/movements", (request, response) => {
  const itemId = typeof request.query.itemId === "string" ? request.query.itemId : undefined;
  return response.json({ success: true, data: getGudangMovements(itemId) });
});

// Pesanan yang masuk ke gudang (confirmed / processing / completed)
router.get("/orders", (_request, response) =>
  response.json({ success: true, data: getGudangOrders() }),
);

// Gudang menerima pesanan: status -> processing, stok gudang dipotong
router.post("/orders/:id/process", (request, response) => {
  const result = processGudangOrder(request.params.id);
  if (result.ok) return response.json({ success: true, data: result });
  if (result.code === "ORDER_NOT_FOUND")
    return response
      .status(404)
      .json({
        success: false,
        error: { code: result.code, message: "Pesanan tidak ditemukan." },
      });
  if (result.code === "STOCK_NOT_ENOUGH")
    return response
      .status(422)
      .json({
        success: false,
        error: { code: result.code, message: "Stok gudang tidak cukup untuk pesanan ini." },
      });
  return response
    .status(400)
    .json({
      success: false,
      error: { code: result.code, message: "Pesanan belum bisa diproses gudang." },
    });
});

// Gudang menandai pesanan selesai dikirim
router.post("/orders/:id/complete", (request, response) => {
  const result = completeGudangOrder(request.params.id);
  if (result.ok) return response.json({ success: true, data: result });
  if (result.code === "ORDER_NOT_FOUND")
    return response
      .status(404)
      .json({
        success: false,
        error: { code: result.code, message: "Pesanan tidak ditemukan." },
      });
  return response
    .status(400)
    .json({
      success: false,
      error: { code: result.code, message: "Pesanan belum bisa ditandai selesai." },
    });
});

// Catat barang masuk: stok bertambah otomatis
router.post("/items/:id/masuk", (request, response) => {
  const parsed = gudangMasukSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_GUDANG_MASUK",
          message: parsed.error.issues[0]?.message ?? "Data barang masuk tidak valid.",
        },
      });
  const result = createGudangMasuk(request.params.id, parsed.data);
  return result.ok
    ? response.json({ success: true, data: result.movement })
    : movementFailure(response, result);
});

// Catat barang keluar: stok berkurang otomatis
router.post("/items/:id/keluar", (request, response) => {
  const parsed = gudangKeluarSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_GUDANG_KELUAR",
          message: parsed.error.issues[0]?.message ?? "Data barang keluar tidak valid.",
        },
      });
  const result = createGudangKeluar(request.params.id, parsed.data);
  return result.ok
    ? response.json({ success: true, data: result.movement })
    : movementFailure(response, result);
});

export default router;
