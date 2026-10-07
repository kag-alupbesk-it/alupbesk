import { getPortfolioItems, getCaseStudies } from "@/services/portfolio";
import { ensureHydrated } from "@/services/supabaseHydrate";

export async function GET() {
  await ensureHydrated();
  return Response.json({ success: true, data: { items: getPortfolioItems(), caseStudies: getCaseStudies() } });
}
