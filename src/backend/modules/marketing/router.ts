import { Router } from "express";
import { z } from "zod";
import {
  createMarketingBanner,
  deleteMarketingBanner,
  getMarketingBanners,
  getMarketingOrders,
  getMarketingReport,
  submitOrderToManager,
  updateMarketingBanner,
} from ".";

const router = Router();

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
    return response.status(400).json({ success: false, error: { code: "INVALID_BANNER", message: parsed.error.issues[0]?.message ?? "Data banner tidak valid." } });
  }
  return response.status(201).json({ success: true, data: createMarketingBanner(parsed.data) });
});

router.put("/banners/:id", (request, response) => {
  const parsed = bannerSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_BANNER", message: parsed.error.issues[0]?.message ?? "Data banner tidak valid." } });
  }
  const banner = updateMarketingBanner(request.params.id, parsed.data);
  if (!banner) return response.status(404).json({ success: false, error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." } });
  return response.json({ success: true, data: banner });
});

router.delete("/banners/:id", (request, response) => {
  if (!deleteMarketingBanner(request.params.id)) {
    return response.status(404).json({ success: false, error: { code: "BANNER_NOT_FOUND", message: "Banner tidak ditemukan." } });
  }
  return response.json({ success: true, data: null });
});

router.get("/orders", (_request, response) => {
  response.json({ success: true, data: getMarketingOrders() });
});

router.post("/orders/:id/submit", (request, response) => {
  const order = submitOrderToManager(request.params.id);
  if (!order) return response.status(404).json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." } });
  return response.json({ success: true, data: order });
});

router.get("/reports", (_request, response) => {
  response.json({ success: true, data: getMarketingReport() });
});

export default router;
