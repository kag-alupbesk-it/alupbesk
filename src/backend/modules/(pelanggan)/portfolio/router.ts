import { Router } from "express";
import { getCaseStudies, getPortfolioItems } from "@/services/portfolio";
const router = Router();
router.get("/", (_request, response) => response.json({ success: true, data: { items: getPortfolioItems(), caseStudies: getCaseStudies() } }));
export default router;
