import { getPortfolioItems, getCaseStudies } from "@/services/portfolio";

export async function GET() {
  return Response.json({ success: true, data: { items: getPortfolioItems(), caseStudies: getCaseStudies() } });
}
