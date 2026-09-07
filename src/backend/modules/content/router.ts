import { Router } from "express";
import { z } from "zod";
import {
  createPartner,
  createFaqItem,
  createCustomService,
  deletePartner,
  deleteFaqItem,
  deleteCustomService,
  getPartners,
  getFaqItems,
  getCustomServices,
  getSiteContents,
  updatePartner,
  updateFaqItem,
  updateCustomService,
  upsertSiteContent,
  getSiteContentByKey,
} from ".";
import {
  createPortfolioItem,
  createCaseStudy,
  updatePortfolioItem,
  updateCaseStudy,
  deletePortfolioItemById,
  deleteCaseStudyById,
  getPortfolioItems,
  getCaseStudies,
} from "@/services/portfolio";

const router = Router();

const partnerSchema = z.object({
  name: z.string().trim().min(1, "Nama mitra wajib diisi."),
  initials: z.string().trim().min(1, "Inisial mitra wajib diisi."),
  logoUrl: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

const faqSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi."),
  answer: z.string().trim().min(1, "Jawaban wajib diisi."),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

const serviceSchema = z.object({
  icon: z.string().trim().min(1, "Ikon wajib diisi."),
  title: z.string().trim().min(1, "Judul layanan wajib diisi."),
  description: z.string().trim().min(1, "Deskripsi layanan wajib diisi."),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

const siteContentSchema = z.object({
  key: z.string().trim().min(1, "Key konten wajib diisi."),
  value: z.record(z.string(), z.unknown()),
});

// --- Partners ---
router.get("/partners", (_request, response) => {
  response.json({ success: true, data: getPartners() });
});

router.post("/partners", (request, response) => {
  const parsed = partnerSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_PARTNER", message: parsed.error.issues[0]?.message ?? "Data mitra tidak valid." } });
  }
  return response.status(201).json({ success: true, data: createPartner(parsed.data) });
});

router.put("/partners/:id", (request, response) => {
  const parsed = partnerSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_PARTNER", message: parsed.error.issues[0]?.message ?? "Data mitra tidak valid." } });
  }
  const partner = updatePartner(request.params.id, parsed.data);
  if (!partner) {
    return response.status(404).json({ success: false, error: { code: "PARTNER_NOT_FOUND", message: "Mitra tidak ditemukan." } });
  }
  return response.json({ success: true, data: partner });
});

router.delete("/partners/:id", (request, response) => {
  if (!deletePartner(request.params.id)) {
    return response.status(404).json({ success: false, error: { code: "PARTNER_NOT_FOUND", message: "Mitra tidak ditemukan." } });
  }
  return response.json({ success: true, data: null });
});

// --- FAQ ---
router.get("/faq", (_request, response) => {
  response.json({ success: true, data: getFaqItems() });
});

router.post("/faq", (request, response) => {
  const parsed = faqSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_FAQ", message: parsed.error.issues[0]?.message ?? "Data FAQ tidak valid." } });
  }
  return response.status(201).json({ success: true, data: createFaqItem(parsed.data) });
});

router.put("/faq/:id", (request, response) => {
  const parsed = faqSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_FAQ", message: parsed.error.issues[0]?.message ?? "Data FAQ tidak valid." } });
  }
  const item = updateFaqItem(request.params.id, parsed.data);
  if (!item) {
    return response.status(404).json({ success: false, error: { code: "FAQ_NOT_FOUND", message: "FAQ tidak ditemukan." } });
  }
  return response.json({ success: true, data: item });
});

router.delete("/faq/:id", (request, response) => {
  if (!deleteFaqItem(request.params.id)) {
    return response.status(404).json({ success: false, error: { code: "FAQ_NOT_FOUND", message: "FAQ tidak ditemukan." } });
  }
  return response.json({ success: true, data: null });
});

// --- Custom services ---
router.get("/services", (_request, response) => {
  response.json({ success: true, data: getCustomServices() });
});

router.post("/services", (request, response) => {
  const parsed = serviceSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_SERVICE", message: parsed.error.issues[0]?.message ?? "Data layanan tidak valid." } });
  }
  return response.status(201).json({ success: true, data: createCustomService(parsed.data) });
});

router.put("/services/:id", (request, response) => {
  const parsed = serviceSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_SERVICE", message: parsed.error.issues[0]?.message ?? "Data layanan tidak valid." } });
  }
  const service = updateCustomService(request.params.id, parsed.data);
  if (!service) {
    return response.status(404).json({ success: false, error: { code: "SERVICE_NOT_FOUND", message: "Layanan tidak ditemukan." } });
  }
  return response.json({ success: true, data: service });
});

router.delete("/services/:id", (request, response) => {
  if (!deleteCustomService(request.params.id)) {
    return response.status(404).json({ success: false, error: { code: "SERVICE_NOT_FOUND", message: "Layanan tidak ditemukan." } });
  }
  return response.json({ success: true, data: null });
});

// --- Site content (hero/profile/contact + custom meta) ---
router.get("/site", (_request, response) => {
  response.json({ success: true, data: getSiteContents() });
});

router.put("/site/:key", (request, response) => {
  const parsed = siteContentSchema.safeParse({ ...request.body, key: request.params.key });
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_SITE_CONTENT", message: parsed.error.issues[0]?.message ?? "Data konten tidak valid." } });
  }
  const content = upsertSiteContent({ key: parsed.data.key, value: parsed.data.value });
  return response.json({ success: true, data: content });
});

router.get("/site/:key", (request, response) => {
  const content = getSiteContentByKey(request.params.key);
  if (!content) {
    return response.status(404).json({ success: false, error: { code: "SITE_CONTENT_NOT_FOUND", message: "Konten tidak ditemukan." } });
  }
  return response.json({ success: true, data: content });
});

// --- Portfolio items ---
const portfolioItemSchema = z.object({
  client: z.string().trim().min(1, "Nama klien wajib diisi."),
  industry: z.string().trim().min(1, "Industri wajib diisi."),
  title: z.string().trim().min(1, "Judul proyek wajib diisi."),
  challenge: z.string().trim().min(1, "Tantangan wajib diisi."),
  solution: z.string().trim().min(1, "Solusi wajib diisi."),
  result: z.string().trim().min(1, "Hasil wajib diisi."),
  img: z.string().trim().optional(),
  tags: z.array(z.string()).default([]),
  year: z.number().int().optional(),
});

const caseStudySchema = z.object({
  client: z.string().trim().min(1, "Nama klien wajib diisi."),
  logo: z.string().trim().default(""),
  industry: z.string().trim().min(1, "Industri wajib diisi."),
  title: z.string().trim().min(1, "Judul wajib diisi."),
  desc: z.string().trim().default(""),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  img: z.string().trim().optional(),
  year: z.number().int().optional(),
});

router.get("/portfolio", (_request, response) => {
  response.json({ success: true, data: { items: getPortfolioItems(), caseStudies: getCaseStudies() } });
});

router.post("/portfolio/items", (request, response) => {
  const parsed = portfolioItemSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_PORTFOLIO", message: parsed.error.issues[0]?.message ?? "Data portofolio tidak valid." } });
  }
  return response.status(201).json({ success: true, data: createPortfolioItem(parsed.data) });
});

router.put("/portfolio/items/:id", (request, response) => {
  const parsed = portfolioItemSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_PORTFOLIO", message: parsed.error.issues[0]?.message ?? "Data portofolio tidak valid." } });
  }
  const item = updatePortfolioItem(Number(request.params.id), parsed.data);
  if (!item) {
    return response.status(404).json({ success: false, error: { code: "PORTFOLIO_NOT_FOUND", message: "Portofolio tidak ditemukan." } });
  }
  return response.json({ success: true, data: item });
});

router.delete("/portfolio/items/:id", (request, response) => {
  if (!deletePortfolioItemById(Number(request.params.id))) {
    return response.status(404).json({ success: false, error: { code: "PORTFOLIO_NOT_FOUND", message: "Portofolio tidak ditemukan." } });
  }
  return response.json({ success: true, data: null });
});

router.post("/portfolio/studies", (request, response) => {
  const parsed = caseStudySchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_CASE_STUDY", message: parsed.error.issues[0]?.message ?? "Data studi kasus tidak valid." } });
  }
  return response.status(201).json({ success: true, data: createCaseStudy(parsed.data) });
});

router.put("/portfolio/studies/:id", (request, response) => {
  const parsed = caseStudySchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ success: false, error: { code: "INVALID_CASE_STUDY", message: parsed.error.issues[0]?.message ?? "Data studi kasus tidak valid." } });
  }
  const study = updateCaseStudy(Number(request.params.id), parsed.data);
  if (!study) {
    return response.status(404).json({ success: false, error: { code: "CASE_STUDY_NOT_FOUND", message: "Studi kasus tidak ditemukan." } });
  }
  return response.json({ success: true, data: study });
});

router.delete("/portfolio/studies/:id", (request, response) => {
  if (!deleteCaseStudyById(Number(request.params.id))) {
    return response.status(404).json({ success: false, error: { code: "CASE_STUDY_NOT_FOUND", message: "Studi kasus tidak ditemukan." } });
  }
  return response.json({ success: true, data: null });
});

export default router;
