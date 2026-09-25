import { Router } from "express";
import { z } from "zod";
import {
  createMarketingBanner,
  createMarketingProduct,
  deleteMarketingBanner,
  deleteMarketingProduct,
  getMarketingBanners,
  getMarketingOrders,
  getMarketingProducts,
  getMarketingReport,
  submitOrderToManager,
  updateMarketingBanner,
  updateMarketingProduct,
} from ".";

const router = Router();

const productSchema = z.object({
  category: z.string().trim().min(1, "Kategori wajib diisi."),
  title: z.string().trim().min(1, "Nama produk wajib diisi."),
  desc: z.string().trim().min(1, "Deskripsi wajib diisi."),
  price: z.number().int().min(0, "Harga tidak boleh negatif."),
  stock: z.number().int().min(0, "Stok tidak boleh negatif."),
  img: z.string().trim().min(1, "URL gambar wajib diisi."),
  sku: z.string().trim().min(1, "SKU wajib diisi."),
});

const bannerSchema = z.object({
  title: z.string().trim().min(1, "Judul banner wajib diisi."),
  subtitle: z.string().trim().optional(),
  imageUrl: z.string().trim().min(1, "URL gambar wajib diisi."),
  linkUrl: z.string().trim().optional(),
  active: z.boolean(),
  order: z.number().int().min(0),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
});

router.get("/banners", (_request, response) => {
  response.json({ success: true, data: getMarketingBanners() });
});

router.post("/banners", (request, response) => {
  const parsed = bannerSchema.safeParse(request.body);
  if (!parsed.success) {
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_BANNER",
          message:
            parsed.error.issues[0]?.message ?? "Data banner tidak valid.",
        },
      });
  }
  return response
    .status(201)
    .json({ success: true, data: createMarketingBanner(parsed.data) });
});

router.put("/banners/:id", (request, response) => {
  const parsed = bannerSchema.safeParse(request.body);
  if (!parsed.success) {
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_BANNER",
          message:
            parsed.error.issues[0]?.message ?? "Data banner tidak valid.",
        },
      });
  }
  const banner = updateMarketingBanner(request.params.id, parsed.data);
  if (!banner)
    return response
      .status(404)
      .json({
        success: false,
        error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." },
      });
  return response.json({ success: true, data: banner });
});

router.delete("/banners/:id", (request, response) => {
  if (!deleteMarketingBanner(request.params.id)) {
    return response
      .status(404)
      .json({
        success: false,
        error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." },
      });
  }
  return response.json({ success: true, data: null });
});

router.get("/orders", (_request, response) => {
  response.json({ success: true, data: getMarketingOrders() });
});

router.post("/orders/:id/submit", (request, response) => {
  const order = submitOrderToManager(request.params.id);
  if (!order)
    return response
      .status(404)
      .json({
        success: false,
        error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." },
      });
  return response.json({ success: true, data: order });
});

router.get("/reports", (_request, response) => {
  response.json({ success: true, data: getMarketingReport() });
});

router.get("/products", (_request, response) => {
  response.json({ success: true, data: getMarketingProducts() });
});

router.post("/products", (request, response) => {
  const parsed = productSchema.safeParse(request.body);
  if (!parsed.success) {
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_PRODUCT",
          message:
            parsed.error.issues[0]?.message ?? "Data produk tidak valid.",
        },
      });
  }
  return response
    .status(201)
    .json({ success: true, data: createMarketingProduct(parsed.data) });
});

router.put("/products/:id", (request, response) => {
  const parsed = productSchema.safeParse(request.body);
  if (!parsed.success) {
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_PRODUCT",
          message:
            parsed.error.issues[0]?.message ?? "Data produk tidak valid.",
        },
      });
  }
  const product = updateMarketingProduct(
    Number(request.params.id),
    parsed.data,
  );
  if (!product)
    return response
      .status(404)
      .json({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Produk tidak ditemukan.",
        },
      });
  return response.json({ success: true, data: product });
});

router.delete("/products/:id", (request, response) => {
  if (!deleteMarketingProduct(Number(request.params.id))) {
    return response
      .status(404)
      .json({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Produk tidak ditemukan.",
        },
      });
  }
  return response.json({ success: true, data: null });
});

export default router;
