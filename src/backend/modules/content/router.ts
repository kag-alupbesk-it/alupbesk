import { Router } from "express";
import { z } from "zod";
import {
  createPartner,
  createCustomService,
  deletePartner,
  deleteCustomService,
  getPartners,
  getCustomServices,
  getSiteContents,
  updatePartner,
  updateCustomService,
  upsertSiteContent,
  getSiteContentByKey,
} from ".";
import {
  createPortfolioItem,
  createCaseStudy,
  deletePortfolioItemById,
  deleteCaseStudyById,
  updatePortfolioItem,
  updateCaseStudy,
} from "@/services/portfolio/crud";
import { getPortfolioItems, getCaseStudies } from "@/services/portfolio/index";

const router = Router();

// Partners
router.get("/partners", async (req, res) => res.json({ success: true, data: await getPartners() }));
router.post("/partners", async (req, res) => {
  const input = z.object({ name: z.string(), initials: z.string(), logoUrl: z.string().optional(), sortOrder: z.number().default(0), active: z.boolean().default(true) }).parse(req.body);
  res.json({ success: true, data: await createPartner(input) });
});
router.put("/partners/:id", async (req, res) => {
  const input = z.object({ name: z.string().optional(), initials: z.string().optional(), logoUrl: z.string().optional(), sortOrder: z.number().optional(), active: z.boolean().optional() }).parse(req.body);
  res.json({ success: true, data: await updatePartner(req.params.id, input) });
});
router.delete("/partners/:id", async (req, res) => {
  await deletePartner(req.params.id);
  res.json({ success: true });
});

// Services
router.get("/services", async (req, res) => res.json({ success: true, data: await getCustomServices() }));
router.post("/services", async (req, res) => {
  const input = z.object({ icon: z.string(), title: z.string(), description: z.string(), sortOrder: z.number().default(0), active: z.boolean().default(true) }).parse(req.body);
  res.json({ success: true, data: await createCustomService(input) });
});
router.put("/services/:id", async (req, res) => {
  const input = z.object({ icon: z.string().optional(), title: z.string().optional(), description: z.string().optional(), sortOrder: z.number().optional(), active: z.boolean().optional() }).parse(req.body);
  res.json({ success: true, data: await updateCustomService(req.params.id, input) });
});
router.delete("/services/:id", async (req, res) => {
  await deleteCustomService(req.params.id);
  res.json({ success: true });
});

// Site Content
router.get("/site", async (req, res) => res.json({ success: true, data: await getSiteContents() }));
router.get("/site/:key", async (req, res) => res.json({ success: true, data: await getSiteContentByKey(req.params.key) }));
router.post("/site", async (req, res) => {
  const input = z.object({ key: z.string(), value: z.record(z.string(), z.unknown()) }).parse(req.body);
  const result = upsertSiteContent(input);
  res.json({ success: true, data: result });
});

// Portfolio & Case Studies
router.get("/portfolio", async (req, res) => res.json({ success: true, data: await getPortfolioItems() }));
router.post("/portfolio", async (req, res) => {
  const input = z.object({ client: z.string(), industry: z.string(), title: z.string(), challenge: z.string(), solution: z.string(), result: z.string(), img: z.string().optional(), tags: z.array(z.string()).default([]), year: z.number().optional() }).parse(req.body);
  res.json({ success: true, data: await createPortfolioItem(input) });
});
router.put("/portfolio/:id", async (req, res) => {
  const input = z.object({ client: z.string().optional(), industry: z.string().optional(), title: z.string().optional(), challenge: z.string().optional(), solution: z.string().optional(), result: z.string().optional(), img: z.string().optional(), tags: z.array(z.string()).optional(), year: z.number().optional() }).parse(req.body);
  res.json({ success: true, data: await updatePortfolioItem(Number(req.params.id), input) });
});
router.delete("/portfolio/:id", async (req, res) => {
  await deletePortfolioItemById(Number(req.params.id));
  res.json({ success: true });
});

router.get("/case-studies", async (req, res) => res.json({ success: true, data: await getCaseStudies() }));
router.post("/case-studies", async (req, res) => {
  const input = z.object({ client: z.string(), logo: z.string().optional(), industry: z.string(), title: z.string(), description: z.string().optional(), desc: z.string().optional(), metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]), img: z.string().optional(), year: z.number().optional() }).parse(req.body);
  const payload = { ...input, desc: (input.desc ?? input.description ?? "") };
  res.json({ success: true, data: await createCaseStudy(payload as any) });
});
router.put("/case-studies/:id", async (req, res) => {
  const input = z.object({ client: z.string().optional(), logo: z.string().optional(), industry: z.string().optional(), title: z.string().optional(), description: z.string().optional(), desc: z.string().optional(), metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(), img: z.string().optional(), year: z.number().optional() }).parse(req.body);
  const payload = { ...input, desc: input.desc ?? input.description };
  res.json({ success: true, data: await updateCaseStudy(Number(req.params.id), payload as any) });
});
router.delete("/case-studies/:id", async (req, res) => {
  await deleteCaseStudyById(Number(req.params.id));
  res.json({ success: true });
});

export default router;
