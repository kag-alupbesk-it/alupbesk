import { Router } from "express";
import { getCatalogProduct, getCatalogProducts } from "@/services/catalog";
const router = Router();
router.get("/products", (_request, response) => response.json({ success: true, data: getCatalogProducts() }));
router.get("/products/:id", (request, response) => { const product = getCatalogProduct(Number(request.params.id)); return product ? response.json({ success: true, data: product }) : response.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." } }); });
export default router;
