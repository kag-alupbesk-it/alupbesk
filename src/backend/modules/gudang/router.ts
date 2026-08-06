import { Router } from "express";
import { z } from "zod";
import { createGudangItem, deleteGudangItem, getGudangItems, updateGudangItem } from ".";

const router = Router();
const gudangItemSchema = z.object({ sku: z.string().trim().min(1), jenisBarang: z.enum(["handle", "mortise"]), merek: z.string().trim().min(1), warna: z.string().trim(), seksiLokasi: z.string().trim().min(1), stok: z.number().int().min(0), minStok: z.number().int().min(0), catatan: z.string().trim().optional() });

router.get("/items", (_request, response) => response.json({ success: true, data: getGudangItems() }));
router.post("/items", (request, response) => {
  const parsed = gudangItemSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ success: false, error: { code: "INVALID_GUDANG_ITEM", message: "Data barang tidak valid." } });
  try { return response.status(201).json({ success: true, data: createGudangItem(parsed.data) }); }
  catch (error) { return response.status(409).json({ success: false, error: { code: "DUPLICATE_SKU", message: error instanceof Error ? error.message : "SKU sudah digunakan." } }); }
});
router.put("/items/:id", (request, response) => {
  const parsed = gudangItemSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ success: false, error: { code: "INVALID_GUDANG_ITEM", message: "Data barang tidak valid." } });
  try { const item = updateGudangItem(request.params.id, parsed.data); return item ? response.json({ success: true, data: item }) : response.status(404).json({ success: false, error: { code: "GUDANG_ITEM_NOT_FOUND", message: "Barang tidak ditemukan." } }); }
  catch (error) { return response.status(409).json({ success: false, error: { code: "DUPLICATE_SKU", message: error instanceof Error ? error.message : "SKU sudah digunakan." } }); }
});
router.delete("/items/:id", (request, response) => deleteGudangItem(request.params.id) ? response.json({ success: true, data: null }) : response.status(404).json({ success: false, error: { code: "GUDANG_ITEM_NOT_FOUND", message: "Barang tidak ditemukan." } }));

export default router;
