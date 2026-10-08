import { getPortfolioItems, getCaseStudies } from "@/services/portfolio/index";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: { items: getPortfolioItems(), caseStudies: getCaseStudies() } });
}
