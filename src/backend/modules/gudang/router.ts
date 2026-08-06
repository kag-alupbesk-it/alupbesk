import { Router } from "express";
import { z } from "zod";
import { getGudangItems, updateGudangStock } from ".";

const router = Router();
const gudangStockSchema = z.object({
  stok: z.number().int().min(0, "Stok tidak boleh negatif."),
  minStok: z.number().int().min(0, "Minimum stok tidak boleh negatif."),
});

router.get("/items", (_request, response) =>
  response.json({ success: true, data: getGudangItems() }),
);
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

export default router;
